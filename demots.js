"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const { validUUID4 } = require('mybase');
function start() {
    return __awaiter(this, void 0, void 0, function* () {
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
                    validator: (v) => validUUID4(v)
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
            ];
            let response = (0, _1.validateParameters)({
                token: 'validToken',
                ip: '1.2.3.4',
                email: 'test@gmail.com'
            }, configuration);
            if (response.validated) {
                console.log(`success`);
            }
            else {
                console.log(`validation has failed:`, response.issues);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
start();
