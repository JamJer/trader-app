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
                    let jsondata;
                    if(body){
                        try {
                            jsondata = JSON.parse(body)
                        } catch (err){
                            console.log(`[User Login][Body 無法被 JSON.parse 解析] error: ${err} ,data: ${jsondata}`)
                        }
                    }

                    // return res 
                    resolve(jsondata)
                })
        })
    })
}

module.exports = requester