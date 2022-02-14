const expect = require('chai').expect
const { validateParameters } = require("../index")

describe('function validateParameters - validation', function () {
    this.timeout(0)
    before(async function () {
    })

    it('second parameter needs to be an array', async function () {
        expect(()=>validateParameters({},{})).to.throw(Error,'array')
    })   
    it('first parameter needs to be an object', async function () {
        expect(()=>validateParameters([],{})).to.throw(Error,'object')
    })

    it('empty validation & not empty target', () => {
        expect(validateParameters({a:'a'},[])).property('validated').to.be.true
    })

    it('key is required',()=>{
        expect(()=>validateParameters({},[{}])).to.throw(Error,'key')
    })
    it('type is required',()=>{
        expect(()=>validateParameters({},[{key:'key'}])).to.throw(Error,'type')
    })
    it('type needs to be an array',()=>{
        expect(()=>validateParameters({},[{key:'key',type:{}}])).to.throw(Error,'type')
    })
    it('type needs to be an array',()=>{
        expect(()=>validateParameters({},[{key:'key',type:{}}])).to.throw(Error,'type')
    })
    it('type needs to have at least 1 member',()=>{
        expect(()=>validateParameters({},[{key:'key',type:[]}])).to.throw(Error,'type')
    })
    it('types member needs to be a valid basic or custom type',()=>{
        expect(()=>validateParameters({},[{key:'key',type:['invalid']}])).to.throw(Error,'is not supported')
    })

    it('if lenght specified it needs to be an array',()=>{
        expect(()=>validateParameters({},[{key:'key',type:['string'],length:{}}])).to.throw(Error,'must be an array')
    })
    it('length needs to have 1-2 members if specified',()=>{
        expect(()=>validateParameters({},[{key:'key',type:['string'],length:[]}])).to.throw(Error,'length property can contain 1 or 2 items')
        expect(()=>validateParameters({},[{key:'key',type:['string'],length:[1,2,3]}])).to.throw(Error,'length property can contain 1 or 2 items')
    })
    
    it('length first member must be smaller than second',()=>{
        expect(()=>validateParameters({},[{key:'key',type:['string'],length:[5,3]}])).to.throw(Error,'first element cannot be greater')
    })

    it('length members needs to be between 0-n and integer',()=>{
        expect(()=>validateParameters({},[{key:'key',type:['string'],length:['a']}])).to.throw(Error,'defined as integer')
        expect(()=>validateParameters({},[{key:'key',type:['string'],length:[true]}])).to.throw(Error,'defined as integer')
        expect(()=>validateParameters({},[{key:'key',type:['string'],length:[{}]}])).to.throw(Error,'defined as integer')
        expect(()=>validateParameters({},[{key:'key',type:['string'],length:[()=>{}]}])).to.throw(Error,'defined as integer')
    })

    it('if required specified then it needs to be a boolean',()=>{
        expect(()=>validateParameters({},[{key:'key',type:['string'],required:{}}])).to.throw(Error,'required property needs to be a boolean')
        expect(()=>validateParameters({},[{key:'key',type:['string'],required:1}])).to.throw(Error,'required property needs to be a boolean')
        expect(()=>validateParameters({},[{key:'key',type:['string'],required:[]}])).to.throw(Error,'required property needs to be a boolean')
        expect(()=>validateParameters({},[{key:'key',type:['string'],required:'true'}])).to.throw(Error,'required property needs to be a boolean')
    })

    it('if required is false then we need to specify a default',()=>{
        expect(()=>validateParameters({},[{key:'key',type:['string'],required:false}])).to.throw(Error,'default')
    })

    it('if validator is specified then it needs to be a function',()=>{
        expect(()=>validateParameters({},[{key:'key',type:['string'],required:false,default:'x',validator:{}}])).to.throw(Error,'validator')
        expect(()=>validateParameters({},[{key:'key',type:['string'],required:false,default:'x',validator:[]}])).to.throw(Error,'validator')
        expect(()=>validateParameters({},[{key:'key',type:['string'],required:false,default:'x',validator:""}])).to.throw(Error,'validator')
    })

    it('we should not mix basic types and custom types',()=>{
        expect(()=>validateParameters({},[{key:'key',type:['string','email'],required:true}])).to.throw(Error,'mix')
    })


    it('min,max values are only compatible with a number type',()=>{
        expect(()=>validateParameters({},[{key:'key',type:['string'],min:1}])).to.throw(Error,'min value is only valid with number types')
        expect(()=>validateParameters({},[{key:'key',type:['string'],max:1}])).to.throw(Error,'max value is only valid with number types')
        expect(()=>validateParameters({},[{key:'key',type:['number'],min:100,max:1}])).to.throw(Error,'min value must be >= max value')
        expect(()=>validateParameters({},[{key:'key',type:['number'],min:'100'}])).to.throw(Error,'min value needs to be a number')
        expect(()=>validateParameters({},[{key:'key',type:['number'],max:'100'}])).to.throw(Error,'max value needs to be a number')
    })

    it('empty validation & empty target', () => {
        expect(validateParameters({},[])).property('validated').to.be.true
    });
})

function isValidated(obj,error) {
    expect(obj).property('validated').to.be.true
    return obj
}

function notValidated(obj,error) {
    expect(obj).property('validated').to.be.false
    expect(JSON.stringify(obj.issues)).contain(error)
}

describe('function validateParameters', function () {
    this.timeout(0)
    it('required keys are required', async function () {
        notValidated(validateParameters({},[{key:'key',required:true,type:['string']}]),'key')
        isValidated(validateParameters({key1:'ok'},[{key:'key1',required:true,type:['string']}]))
    })   

    it('type check', async function () {
        notValidated(validateParameters({a:1},[{key:'a',type:['boolean']}]),'type mismatch')
        notValidated(validateParameters({a:'true'},[{key:'a',type:['boolean']}]),'type mismatch')
        notValidated(validateParameters({a:{}},[{key:'a',type:['boolean']}]),'type mismatch')
        notValidated(validateParameters({a:()=>{}},[{key:'a',type:['boolean']}]),'type mismatch')
        notValidated(validateParameters({a:[]},[{key:'a',type:['boolean']}]),'type mismatch')
        isValidated(validateParameters({a:[]},[{key:'a',type:['array']}]),'type mismatch')
    })

    it('length check - string', async function () {
        notValidated(validateParameters({a:''},[{key:'a',type:['string'],length:[2]}]),'string length')
        notValidated(validateParameters({a:'xxaacc'},[{key:'a',type:['string'],length:[3,5]}]),'string length')
        isValidated(validateParameters({a:'xxaa'},[{key:'a',type:['string'],length:[3,5]}]))
    })
    it('length check - array members', async function () {
        notValidated(validateParameters({a:[]},[{key:'a',type:['array'],length:[2]}]),'array length')
        notValidated(validateParameters({a:[1,2,3,4,5,6,7]},[{key:'a',type:['array'],length:[3,5]}]),'array length')
        isValidated(validateParameters({a:[1,2,3,6,7]},[{key:'a',type:['array'],length:[3,5]}]))
    })

    it('length check - object properties', async function () {
        notValidated(validateParameters({a:{}},[{key:'a',type:['object'],length:[2]}]),'object length')
        notValidated(validateParameters({a:{first:1,second:2,third:3,forth:4,fifth:5,sixt:6}},[{key:'a',type:['object'],length:[3,5]}]),'object length')
        isValidated(validateParameters({a:{first:1,second:2,third:3}},[{key:'a',type:['object'],length:[3,5]}]))
    })

    it('validator function', async function () {
        notValidated(validateParameters({a:'ok'},[{key:'a',type:['string'],validator:(v)=>false}]),'invalid value')
        isValidated(validateParameters({a:'ok'},[{key:'a',type:['string'],validator:(v)=>true}]))
    })

    it('min,max values for numbers', async function () {
        // console.log(validateParameters({a:'ok'},[{key:'a',type:['string'],min:1}]))
        notValidated(validateParameters({a:2},[{key:'a',type:['number'],min:3}]),'should be >=')
        notValidated(validateParameters({a:2.9},[{key:'a',type:['number'],min:3}]),'should be >=')
        notValidated(validateParameters({a:5},[{key:'a',type:['number'],max:4}]),'should be <=')
        notValidated(validateParameters({a:3},[{key:'a',type:['number'],min:5,max:10}]),'should be >=')
        isValidated(validateParameters({a:6},[{key:'a',type:['number'],min:5,max:10}]))
        isValidated(validateParameters({a:5},[{key:'a',type:['number'],min:5,max:10}]))
        isValidated(validateParameters({a:10},[{key:'a',type:['number'],min:5,max:10}]))
    })

    it('default value',async function() {
        // default can be any type
        expect(isValidated(validateParameters({x:5},[{key:'a',type:['ip4'],required:false,default:null}]))).property('values').property('a').be.null
        expect(isValidated(validateParameters({x:5},[{key:'a',type:['ip4'],required:false,default:false}]))).property('values').property('a').be.false
        expect(isValidated(validateParameters({x:5},[{key:'a',type:['ip4'],required:false,default:[]}]))).property('values').property('a').is.a.a('array').lengthOf(0)
        expect(isValidated(validateParameters({x:5},[{key:'a',type:['ip4'],required:false,default:1}]))).property('values').property('a').eq(1)
        expect(isValidated(validateParameters({x:5},[{key:'a',type:['ip4'],required:false,default:'ok'}]))).property('values').property('a').eq('ok')
    })

    it('url custom type',async function() {
        // default can be any type
        notValidated(validateParameters({a:5},[{key:'a',type:['url']}]),'expected url')
        notValidated(validateParameters({a:{}},[{key:'a',type:['url']}]),'expected url')
        notValidated(validateParameters({a:[]},[{key:'a',type:['url']}]),'expected url')
        notValidated(validateParameters({a:'://'},[{key:'a',type:['url']}]),'expected url')
        notValidated(validateParameters({a:'://test'},[{key:'a',type:['url']}]),'expected url')
        notValidated(validateParameters({a:'://test.com'},[{key:'a',type:['url']}]),'expected url')
        isValidated(validateParameters({a:'ftp://test.com'},[{key:'a',type:['url']}]))
        isValidated(validateParameters({a:'http://test.com'},[{key:'a',type:['url']}]))
        isValidated(validateParameters({a:'https://test.com'},[{key:'a',type:['url']}]))
        isValidated(validateParameters({a:'https://test.com:89/ok/index.php'},[{key:'a',type:['url']}]))
    })

})
