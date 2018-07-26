/**
 * User information channel
 */
const request = require('request');
const rp = require('request-promise');

const {db} = require('../model/db');
const config = require('../config/config.default');

// logger 
const {logger} = require('./logger')

// user instance
class user{
    constructor(){

    }

    login(event,arg){
        try{
            // Send message to remote server enroll 
            // Using new api call
            rp.post(config.server.url+config.api.user.login, {simple: false, resolveWithFullResponse: true,form: arg})
            .then((res,body)=>{
                // redirect to new link
                console.log(res.statusCode)
                console.log(res.headers['location'])
                /**
                 * Example usage of logger - start
                 */
                logger.sys_log({
                    type: "Debug",
                    msg: res.headers['location']
                })
                logger.get_sys_log().then((msg)=>{
                    console.log(msg)
                })
                /**
                 * - end
                 */

                rp.post(res.headers['location'],{form: arg})
                    .then((body)=>{
                        let jsondata;
                        if(body){
                            try {
                                jsondata = JSON.parse(body)
                            } catch (err){
                                console.log(`[User Login][Body 無法被 JSON.parse 解析] error: ${err} ,data: ${jsondata}`)
                                // record into system log
                                logger.sys_log({
                                    type: "Error",
                                    msg: `[User Login][Body 無法被 JSON.parse 解析] error: ${err} ,data: ${jsondata}`
                                })
                            }
                        }
                        // Body will be the result
                        let res = jsondata;
                        if(res.msg=="success"){
                            // Store in session 
                            config.store_user(arg.username)
                            // examine product key
                            console.log("Now starting the product key's examinate.")
                            let product_key = res.key;
                            // ============================================ Another process: product key test =======================================
                            let key_check_arg = {
                                username: arg.username,
                                passwd: arg.passwd,
                                key_id: product_key
                            }
                            rp.post(config.server.url+config.api.user.key_check,{simple: false, resolveWithFullResponse: true, form: key_check_arg })
                                .then((res,body) => {
                                    // redirect to new link 
                                    console.log(res.statusCode)
                                    console.log(res.headers['location'])
                                    // the new location
                                    rp.post(res.headers['location'],{form: key_check_arg})
                                        .then((body) => {
                                            let jsondata;
                                            if(body){
                                                try {
                                                    jsondata = JSON.parse(body)
                                                } catch (err){
                                                    console.log(`[User Login - Product key check][Body 無法被 JSON.parse 解析] error: ${err} ,data: ${jsondata}`)
                                                    // record into system log
                                                    logger.sys_log({
                                                        type: "Error",
                                                        msg: `[User Login - Product key check][Body 無法被 JSON.parse 解析] error: ${err} ,data: ${jsondata}`
                                                    })
                                                }
                                            }
                                            // Get response from database 
                                            let response = jsondata;
                                            console.log(response)
                                            if(response.msg=="success"){
                                                // product key are activated
                                                // Store product key 
                                                console.log("Product key examinate success, store all user's config.")
                                                db.store_product_key(arg.username,arg.passwd,product_key,
                                                    (err,msg)=>{
                                                        if(err)
                                                            console.log(err);
                                                        // Send back
                                                        // if res.msg == OK, then represent this user is legal
                                                        // FIXME: In debug mode, all msg will return OK, without compare user data
                                                        // And when this user login success, it will get a unique key of this user to activate trade bot
                                                        event.sender.send('login-success',product_key);
                                                        
                                                        // trader.prepare(arg.username);
                                                    });
                                            }
                                            else{
                                                // send error msg - "not found"/"error id"...
                                                event.sender.send('login-error', "金鑰尚未啟動！請至官網搜尋管道啟用！")
                                                // record into system log
                                                logger.sys_log({
                                                    type: "Login-Error",
                                                    msg: "金鑰尚未啟動！請至官網搜尋管道啟用！"
                                                })
                                            }
                                        })
                                })
                        }
                        else{
                            event.sender.send('login-error',"帳號或密碼錯誤！");
                            // record into system log
                            logger.sys_log({
                                type: "Login-Error",
                                msg: "帳號或密碼錯誤！"
                            })
                        }
                    })
            }) 
        } catch(err) {
            console.log(`[User Login][HTTPS Request-Promise] error: ${err}`)
            // record into system log
            logger.sys_log({
                type: "Error",
                msg: `[User Login][HTTPS Request-Promise] error: ${err}`
            })
        }
    }

    api_config(event,arg){
        /**
         * @param arg.uname         username
         * @param arg.apikey        apikey (for current user)
         * @param arg.apisecret     apisecret (for current user)
         */
        try{
            db.store_api_ks(arg.uname,arg.apikey,arg.apisecret,
                (err,msg)=>{
                    if(err){
                        console.error("Error when api config...");
                        console.log(err);
                    }
                    else{
                        // success !
                        let origin = config.trade;
                        // update
                        config.set_trade({
                            binance_apiKey: arg.apikey,
                            binance_apiSecret: arg.apisecret,
                            binance_recvWindow: origin.binance_recvWindow
                        })
                        // and then write back
                        config.record_trade();
                        // send success signal
                        event.sender.send("api_config_success",{})
                    }
                })
        } catch (err) {
            console.log(`[API Config][DB Store API KEY] error: ${err}`)
            // record into system log
            logger.sys_log({
                type: "Error",
                msg: `[API Config][DB Store API KEY] error: ${err}`
            })
        }
        
    }
}

module.exports = {
    user: new user()
}