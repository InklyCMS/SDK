

const internalSymbol = Symbol("inklyInternal");


function INKLY_INTERNAL_CONDITION(comparator:string, value:any){
    return {
        [internalSymbol]: {
            comparator: comparator.toUpperCase(),
            value: value
        },
        [comparator]: value
    }
}

export function _before(date:Date){
    return INKLY_INTERNAL_CONDITION('before', date);
}

export function _includes(value:any) {
    return INKLY_INTERNAL_CONDITION('includes', value);
}