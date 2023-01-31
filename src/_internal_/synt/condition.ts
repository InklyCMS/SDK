import { InklyWhere, InklyWhereObj } from "../../types";
import { TypedReadonlyDictionary } from "../utils/struct";


const operatorRegistry = new TypedReadonlyDictionary<(field:string,value:any) => string>({
    equals: (f,v) => `'${f}'=${v}`,
    lessThan: (f,v) => `'${f}'<${v}`,
    greaterThan: (f,v) => `'${f}'>${v}`,
    lessThanOrEquals: (f,v) => `'${f}'<=${v}`,
    greaterThanOrEquals: (f,v) => `'${f}'>=${v}`,
    notEqual: (f,v) => `'${f}'!=${v}`,
    contains: (f,v) => `'${f}'<-${v}`,
    includes: (f,v) => `'${f}'<-${v}`
});

function serializeOperator(operator:string, fieldName:string, value:any){
    if (!operatorRegistry.has(operator)) throw new Error(`Unknown operator "${operator}" used.`);
    let output = operatorRegistry.get(operator);
    return output?.(fieldName, value);
}

function expandField<T, K extends InklyWhereObj<T>[keyof T]>(fieldName:string, fieldCondition:K){
    let final:Array<string> = [];
    // preformat
    if (["string", "boolean", "number"].includes(typeof fieldCondition)){
        fieldCondition = op.equals(fieldCondition) as any
    }

    if (!("_operator" in fieldCondition && "_value" in fieldCondition)) {
        for (let p in fieldCondition){
            final.push(...expandField<T, any>(`${fieldName}.${p}`, fieldCondition[p]));
        }
        return final;
    }

    if (!["string", "boolean", "number"].includes(typeof fieldCondition._value)){
        throw new Error("Unexpected field type. Got " + typeof fieldCondition._value);
    }

    let v = typeof fieldCondition._value === "string" ? `"${encodeURIComponent(fieldCondition._value)}"` : encodeURIComponent(fieldCondition._value.toString());

    final.push(serializeOperator(fieldCondition._operator, fieldName, v));

    return final;
}

export function serializeWhereCondition<T extends object>(condition:InklyWhere<T>) {
    
    if (Array.isArray(condition)){
        // multiple, so where must be an OR
        // @ts-ignore
        let orConditions = condition.map(c => serializeWhereCondition<T>(c));
        return orConditions.map((c: string) => `(${c})`).join('|');
    }

    let final = [];

    // single, so where must be an AND

    for (let fieldName in condition) {
        let fieldCondition = condition[fieldName];

        let out = expandField<T, typeof fieldCondition>(fieldName, fieldCondition);

        final.push(...out);
   }

    return final.join('&');

}

class StringWalker {
    private ptr:number = 0;

    constructor(private str:string){}
    movePtrTo(index:number){ this.ptr = index; return this }
    movePtrBy(index:number){
        this.ptr += index;
        return this;
    }
    movePtrUntil(char:string) {
        this.ptr = this.str.indexOf(char, this.ptr);
        return this;
    }
    getContentUntil(char:string){
        let endPtr = this.str.indexOf(char, this.ptr);
        let eaten = this.str.substring(this.ptr, endPtr);
        this.ptr = endPtr;
        return eaten;
    }
    movePtrUntilPairEnd(char:string){
        const endP = {
            "(" : ")",
            "[" : "]"
        }[char];

        let openCount = 0;
        for (let i = this.ptr; i < this.str.length ; i++){
            const character = this.str[i];
            if (char === character) { openCount++; }
            if (endP === character) {
                openCount--;
                if (openCount <= 0) {
                    this.ptr = i;
                    return this;
                }
            }
        }
        return this;
    }
    getContentUntilPairEnd(char:string){
        const start = this.ptr;
        const end = this.movePtrUntilPairEnd(char).ptr;
        return this.substring(start, end);
    }
    substring(from:number, until:number){
        return this.str.substring(from, until);
    }
    at(ptr:number=this.ptr){
        return this.str[ptr];
    }
    eol(){
        return this.ptr >= this.str.length - 1;
    }
    getPtr(){ return this.ptr }

}

export type DeserializedWhereCondition = {
    operation: string,
    left: string,
    right: string
}

export type DeserializedWhereConditionCollection = Array<Array<DeserializedWhereCondition>>;

export function deserializeWhereCondition(conditionString:string) {
    if (conditionString === undefined || conditionString.trim().length === 0) return undefined;

    const getTyped = (c:string) => {
        let value = decodeURIComponent(c);
        if (value.startsWith(`"`) && value.endsWith('"')) value = `string(${value.substring(1, value.length - 1)})`;
        else if (value.startsWith(`'`) && value.endsWith(`'`)) value = `field(${value.substring(1, value.length - 1)})`;
        else if (value === "false" || value === "true") value = `boolean(${value})`;
        else if (!isNaN(value as any)) value = `number(${value})`;
        return value;
    }
    const condition = (left, right, operation) => {
        return {
            operation,
            left: getTyped(left),
            right: getTyped(right)
        } as DeserializedWhereCondition
    }

    const Ors:Array<Array<DeserializedWhereCondition>> = [];

    const getStatements = (sentence:string)=>{
        const walker = new StringWalker(sentence);
        const s = [];

        while (walker.eol() === false) {
            if (walker.at() === "("){
                const substr = walker.getContentUntilPairEnd("(");
                substr.includes("|") ? s.push(...getStatements(substr)) : s.push(substr);
            }
            walker.movePtrBy(1);
        }

        if (s.length <= 0) s.push(sentence);

        return s.map((w:string) => {
            w = w.trim();
            if (w.endsWith("(")) w = w.substring(0, w.length - 2);
            if (w.startsWith("(")) w = w.substring(1);
            return w;
        });
    }

    const statements = getStatements(conditionString);

    for (let statement of statements) {
        const Ands:Array<DeserializedWhereCondition> = [];
        const conds = statement.split('&');
        for (let c of conds) {
            const [target, comp, value] = c.replace(/(=|<-|>=|<=|<|>|!=)/gm, m => `|${m}|`).split('|')
            Ands.push(condition(target,value, comp));
        }
        Ors.push(Ands);
    }

    return Ors;
}

export const op = operatorRegistry.transformGet((property, dict) => {
    return (value:any) => {
        return {
            _operator: property,
            _value: value
        };
    }
});