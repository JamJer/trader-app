/**
 * using to perform redirect request 
 */

const rp = require('request-promise')
const config = require('../config/config.default')

const requester = {}

requester.redirect = function(url,form_data_1, form_data_2){
    // make promise
    return new Promise((resolve, reject) => {
        // first call
        rp.post(url,{simple: false, resolveWithFullResponse: true, form: form_data_1})
            .then((res,body)=>{
                console.log(res.statusCode)
                console.log(res.headers['location'])

                // second call
                rp.post(res.headers['location'], {form: form_data_2})
                    .then((body)=>{
                        // return res 
                        resolve(body)
                    })
        })
    })
}

requester.direct = function(url, form_data){
    return new Promise((resolve,reject)=>{
        // first call
        rp.post(url,{simple: true, resolveWithFullResponse: false,form: form_data})
            .then((body)=>{
                //console.log(body)
                resolve((body))
            })
            .catch((err)=>{
                //console.log(err)
                reject(err)
            })
    })
}

module.exports = requester