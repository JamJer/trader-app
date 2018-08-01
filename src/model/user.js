/**
 * User information channel
 */
const request = require('request');
const rp = require('request-promise');

const {db} = require('../model/db');
const config = require('../config/config.default');

// logger 
const {logger} = require('./logger')

// requester 
const requester = require('./requester')

// user instance
class user{
    constructor(){

    }

    login(event,arg){
        try{
            // Send message to remote server enroll 
            // Using new api call
            requester.redirect(config.server.url+config.api.user.login, arg, arg)
                .then((response)=> {
                    let res;
                    if(response){
                        try {
                            res = JSON.parse(response)
                        } catch (err){
                            console.log(`[User Login][Body 無法被 JSON.parse 解析] error: ${err} ,data: ${res}`)
                        }
                    }
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
                        // ============================================ Another process: product key fetch =======================================
                        console.log("Now starting the product key's fetching.")

                        requester.redirect(config.server.url+config.api.user.key_fetch, key_check_arg, key_check_arg)
                            .then((response)=> {
                                let res;
                                if(response){
                                    try {
                                        res = JSON.parse(response)
                                    } catch (err){
                                        console.log(`[User Login][Body 無法被 JSON.parse 解析] error: ${err} ,data: ${res}`)
                                    }
                                }
                                if(res.msg=="success"){
                                    config.store_user_key_info(res)
                                    console.log("User key information has been stored in config.default")
                                    db.store_product_key(arg.username,arg.passwd,product_key,
                                        (err,msg)=>{
                                            if(err)
                                                console.log(err);
                                            // Send back
                                            // if res.msg == OK, then represent this user is legal
                                            // FIXME: In debug mode, all msg will return OK, without compare user data
                                            // And when this user login success, it will get a unique key of this user to activate trade bot
                                            // event.sender.send('login-success',product_key);
                                            
                                            // trader.prepare(arg.username);
                                        });
                                }
                                else{
                                    console.log(`[User Key Info Fetch][取得使用者limit fund資訊 失敗] ,data: ${JSON.stringify(jsondata)}`)
                                    // record into system log
                                    logger.sys_log({
                                        type: "Error",
                                        msg: `[User Key Info Fetch][取得使用者limit fund資訊 失敗] ,data: ${jsondata}`
                                    })
                                }
                            })
                        // ============================================ Another process: User's own policy list fetch =======================================
                        console.log("Now starting the user's own policy list fetching.")
                        
                        requester.redirect(config.server.url+config.api.user.policy_list, {username: arg.username, passwd: arg.passwd}, key_check_arg)
                            .then((response)=> {
                                let res;
                                if(response){
                                    try {
                                        res = JSON.parse(response)
                                    } catch (err){
                                        console.log(`[User Login][Body 無法被 JSON.parse 解析] error: ${err} ,data: ${res}`)
                                    }
                                }
                                if(res.msg=="found"){
                                    // console.log(JSON.stringify(res))
                                    config.store_user_policy_list(res.policy_list)
                                    console.log("User's own policy information has been stored in config.default")
                                    
                                    // FIXME:
                                    // send to front-end 
                                    // telling app the entire login process finished
                                    event.sender.send('login-success',product_key);
                                }
                                else{
                                    console.log(`[User policy list Fetch][使用者無交易策略可提取] ,data: ${JSON.stringify(jsondata)}`)
                                    // record into system log
                                    logger.sys_log({
                                        type: "Error",
                                        msg: `[User policy list Fetch][使用者無交易策略可提取] ,data: ${jsondata}`
                                    })
                                }
                            })
                    }
                    else{
                        event.sender.send('login-error',"帳號或密碼錯誤！");
                    }
                })
        } catch(err){

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