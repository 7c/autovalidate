const { validEmail, validURL } = require('mybase')

function validateParameters(target, validate) {
    function propExists(t, propName) {
        return (t && Object.hasOwnProperty.call(t, propName))
    }

    function isURL(url) {
        if (typeof url === 'string')
            try { return new URL(url) } catch (e) { }
        return false
    }

    function customType(val) {
        var net = require('net')
        if (net.isIPv4(val) === true) return 'ip4'
        if (net.isIPv6(val) === true) return 'ip6'
        if (isURL(val)) return 'url'
        if (validEmail(val) === true) return 'email'
        return typeOf(val)
    }

    function typeOf(val) {
        if (Array.isArray(val)) return 'array'
        if (typeof val === 'object') return 'object'
        if (typeof val === 'string') return 'string'
        if (val === false || val === true) return 'boolean'
        if (!isNaN(parseFloat(val))) return 'number'
        return 'unknown'
    }

    if (typeOf(target) !== 'object') throw new Error("target needs to be an object") // tested
    if (typeOf(validate) !== 'array') throw new Error("'validate' needs to be an array") //tested
    let custom_types = ['ip4', 'email', 'ip6', 'url']
    let basic_types = ['string', 'number', 'boolean', 'array', 'object']

    let response = {
        validated: true,
        issues: [],
        values: {}
    }

    // validate the structure of validate object
    for (let row of validate) {
        if (!row.hasOwnProperty('required')) row.required = true

        if (!row.hasOwnProperty('key')) throw new Error("key is required")
        if (!row.hasOwnProperty('type') || !Array.isArray(row.type) || row.type.length === 0) throw new Error("type is required and must be array")
        for (let t of row.type)
            if (!basic_types.includes(t) && !custom_types.includes(t)) throw new Error(`Type '${t}' is not supported`)


        if (row.hasOwnProperty('length')) {
            if (!Array.isArray(row['length'])) throw new Error('optional length must be an array')
            if (row['length'].length == 0 || row['length'].length > 2) throw new Error('optional length property can contain 1 or 2 items')
            if (row['length'][0] > row['length'][1]) throw new Error('optional length properties first element cannot be greater than second one')
            for (let l of row['length']) if (l < 0 || isNaN(parseInt(l))) throw new Error('optional length property needs to be defined as integer min,max or only min')
        }

        if (row.hasOwnProperty('required') && typeof row.required !== 'boolean') throw new Error('required property needs to be a boolean')
        if ((!row.hasOwnProperty('required') || row.required === false) && !row.hasOwnProperty('default')) throw new Error(`not required field "${row.key}" need to define a "default" value`)
        // make sure validator is a function
        if (row.hasOwnProperty('validator') && typeof row.validator !== 'function') throw new Error('validator needs to be a function')

        // numbers can define min,max values
        if (row.type.includes('number')) {
            if (row.hasOwnProperty('min') && typeof row.min !== 'number') throw new Error('min value needs to be a number')
            if (row.hasOwnProperty('max') && typeof row.max !== 'number') throw new Error('max value needs to be a number')
            let min = row.hasOwnProperty('min') ? row.min : false
            let max = row.hasOwnProperty('max') ? row.max : false
            if (min && max && min > max) throw new Error('min value must be >= max value')
        } else {
            if (row.hasOwnProperty('min')) throw new Error('min value is only valid with number types')
            if (row.hasOwnProperty('max')) throw new Error('max value is only valid with number types')
        }



        // we should not mix basic_types and custom_types
        let __ct = 0
        let __bt = 0
        for (let i of custom_types) if (row.type.includes(i)) __ct++
        for (let i of basic_types) if (row.type.includes(i)) __bt++
        if (__ct !== 0 && __bt !== 0) throw new Error(`Do not mix basic types and custom types for key "${row.key}"`)
    }


    // default population
    for (let row of validate) {
        if (row.required === false) {
            row.actualValue = propExists(target, row.key) ? target[row.key] : row.default
        }
    }


    // required field
    for (let row of validate) {
        if (row.hasOwnProperty('required') && row.required === true)
            if (!propExists(target, row.key)) {
                response.validated = false
                response.issues.push(`'${row.key}' is required`)
            } else {
                row.actualValue = target[row.key]
            }
    }
    // type check
    if (response.validated) {
        for (let row of validate) {
            let actualValue = row.actualValue

            // if (row.hasOwnProperty('default') && typeOf(row.default) === typeOf(actualValue)) continue
            if (row.hasOwnProperty('default')) {
                if (!target.hasOwnProperty(row.key)) continue
                if (row.type.includes(customType(target[row.key]))) continue
            }
                

            if (!row.type.includes(typeOf(actualValue)) && !row.type.includes(customType(actualValue))) {
                // if (!row.hasOwnProperty('default') && typeOf(row.default)!==typeOf(actualValue)) 
                {
                    response.validated = false
                    response.issues.push(`'${row.key}' type mismatch, expected ${row.type.join(',')}, got '${typeOf(actualValue)}'`)
                }
            }
        }
    }

    // length           for string, array (members), object (keys)
    // min,max          for number
    if (response.validated) {
        for (let row of validate) {
            let actualValue = row.actualValue
            // number min,max
            if (typeOf(actualValue) === 'number') {
                // min
                if (row.hasOwnProperty('min') && actualValue < row.min) {
                    response.validated = false
                    response.issues.push(`'${row.key}' should be >= ${row.min}`)
                }
                // max
                if (row.hasOwnProperty('max') && actualValue > row.max) {
                    response.validated = false
                    response.issues.push(`'${row.key}' should be <= ${row.max}`)
                }
            }


            if (!row.hasOwnProperty('length')) continue
            let minLength = parseInt(row['length'][0])
            let maxLength = row['length'].length == 2 ? parseInt(row['length'][1]) : false

            // string length
            if (typeOf(actualValue) === 'string') {
                if (actualValue.length < minLength || (maxLength && actualValue.length > maxLength)) {
                    response.validated = false
                    response.issues.push(`'${row.key}' has invalid string length, expected ${minLength}${maxLength ? '-' + maxLength : ''}}`)
                }
            }
            // array member length
            if (typeOf(actualValue) === 'array') {
                if (actualValue.length < minLength || (maxLength && actualValue.length > maxLength)) {
                    response.validated = false
                    response.issues.push(`'${row.key}' has invalid array length, expected ${minLength}${maxLength ? '-' + maxLength : ''}}`)
                }
            }
            // Object member length
            if (typeOf(actualValue) === 'object') {
                if (Object.keys(actualValue).length < minLength || (maxLength && Object.keys(actualValue).length > maxLength)) {
                    response.validated = false
                    response.issues.push(`'${row.key}' has invalid object length, expected ${minLength}${maxLength ? '-' + maxLength : ''}}`)
                }
            }
        }
    }
    // validator
    if (response.validated) {
        for (let row of validate) {
            if (row.hasOwnProperty('validator') && typeof row.validator === 'function') {
                if (row.validator(row.actualValue) === false) {
                    response.validated = false
                    response.issues.push(`${row.key} has invalid value`)
                }
            }
        }
    }

    // put values
    if (response.validated) {
        for (let row of validate) {
            response.values[row.key] = row.actualValue
        }
    }
    return response
}

module.exports = { validateParameters }