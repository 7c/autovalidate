import { validateParameters } from "."
const { validUUID4 } = require('mybase')

async function start() {
    try {
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
                validator: (v:any) => validUUID4(v)
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
            console.log(`success`)
        } else {
            console.log(`validation has failed:`,response.issues)
        }
    } catch (err) {
        console.log(err)
    }
}

start()