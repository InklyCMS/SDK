import { InklyWhere, InklyWhereObj } from "../../types";

function expandField<T, K extends InklyWhereObj<T>[keyof T]>(fieldName:string, fieldCondition:K){
    let final:Array<string> = [];
    // preformat
    if (["string", "boolean", "number"].includes(typeof fieldCondition)){
        fieldCondition = {
            _operator: "eq",
            _value: fieldCondition
        } as any
    }

    if (!("_operator" in fieldCondition || "_value" in fieldCondition)) {
        for (let p in fieldCondition){
            final.push(...expandField<T, any>(`${fieldName}.${p}`, fieldCondition[p]));
        }
        return final;
    }

    if (!["string", "boolean", "number"].includes(typeof fieldCondition._value)){
        throw new Error("Unexpected field type. Got " + typeof fieldCondition._value);
    }

    let v = typeof fieldCondition._value === "string" ? `"${encodeURIComponent(fieldCondition._value)}"` : encodeURIComponent(fieldCondition._value.toString());

    switch (fieldCondition._operator) {
        case "eq":
            final.push(`"${fieldName}"=${v}`);
            break;
        case "lt":
            final.push(`"${fieldName}"<${v}`);
            break;
        case "gt":
            final.push(`"${fieldName}">${v}`);
            break;
        case "gt":
            final.push(`"${fieldName}"!=${v}`);
            break;
    }
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