

export class TypedReadonlyDictionary<K, T extends object = Record<string, K>> {
    
    constructor(private readonly originalValues:T){}

    has(propertyName:(keyof T | string)){
        return this.originalValues.hasOwnProperty(propertyName);
    }

    get(propertyName:string): K{
        return this.originalValues[propertyName];
    }

    keys(){
        return Object.keys(this.originalValues) as Array<T[keyof T]>;
    }

    values(){
        return Object.values(this.originalValues);
    }

    entries(){
        return Object.entries(this.originalValues);
    }

    get length(){
        return Object.keys(this.originalValues).length;
    }

    toString(){
        return JSON.stringify(this.originalValues);
    }

    transformGet<F>(transformer:(propertName:string, dict:this)=>F){
        return new Proxy(this.originalValues, {
            get: (target, pn, receiver) => {
                if (typeof pn === "string"){
                    return transformer(pn, this);
                }
                return Reflect.get(target, pn, receiver);
            }
        }) as Record<keyof T, F>
    }

}