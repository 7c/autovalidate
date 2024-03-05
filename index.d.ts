export type autovalidateReturn = {
    validated:boolean,
    issues:Array<string>,
    values:any
}

export type autoValidateConfigurationItem = {
    key:string,
    type:Array<string>,
    required?:boolean=true,
    default?:any,
    validator?:function=undefined,
    min?:number=false,
    max?:number=false,
    length?:Array<number>
}

export declare function validateParameters(target:object, validate:Array<autoValidateConfigurationItem>): autovalidateReturn