## autovalidate

small but well-tested library for input validation

### Installation
`
npm i @7c/autovalidate --save
`

### Features
- custom validator
- custom types
- required / optional keys
- multiple type support
- length support for string,arrays(items),object(keycount)
- min,max support for number

## Types
### Custom Types
ip4,ip6,url,email
### Basic Types
string,boolean,number,array,object

### validateParameters(inputObject,configuration)
this function takes an input object such as `req.body` or `req.params` or any Javascript Hash Object. This function throws an exception in case the configuration is troublesome. This will avoid you as developer from mistakes. Since the configuration is constant, you do not expect an exception at production.

```
const  { validateParameters } = require('autovalidate')

let configuration = [
    { key: 'token', type: ['string'] },
    { key: 'ip', type: ['ip4'] },
    { key: 'from', type: ['email'] },
    {
        key: 'PayerID', type: ['string'],
        length: [3, 64],
        required: false,
        default: 'NONE'
    },
    {
        key: 'uuid', type: ['string'],
        required: true,
        validator: (v) => validUUID(v)
    },
    {
        key: 'optional', type: ['string', 'boolean'],
        required: false,
        default: false
    },
    {
        key: 'theid', type: ['number'],
        min: 1,
        required: false,
        default: false
    }
]
let response = validateParameters({
    token: 'validToken',
    ip: '1.2.3.4',
    email: 'test@gmail.com'
}, configuration )

if (response.validated) {
    console.log(`sucess`)
} else {
    console.log(`validation has failed:`,response.issues)
}

```

## response
the response is a structure which has 3 properties: `validated:bool`,`issues:[]`,`values:{}`

### validation failed
if validation has failed then you will have `validated` set to false, `issues` array will contain explanation why the validation has failed and `values` object will be empty
```
{
  validated: false,
  issues: [ "'from' is required", "'uuid' is required" ],
  values: {}
}
```
### validation succeed
then `validated` will be true, issues array will be empty and `values` object contains corresponding values
