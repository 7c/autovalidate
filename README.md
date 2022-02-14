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
    {
        key:'token',
        type:['string'],
    },
    {
        key:'ip',
        type:['ip4']
    },
    {
        key:'from',
        type:['email']
    },
    {
        key:'PayerID',
        type:['string],
        length:[3,64]
        required:false,
        default:'NONE'
    },
    {
        key:'uuid',
        type:['string'],
        required:true,
        validator: (v)=>validUUID(v)
    },
    {
        key: 'optional',
        type: ['string','boolean'],
        required:false,
        default:false
    },
    {
        key: 'theid',
        type: ['number'],
        min: 1,
        required:false,
        default:false
    }
]

let response = validateParameters({
    token:'validToken',
    ip:'1.2.3.4',
    email:'test@gmail.com'
}
)

```