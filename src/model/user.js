/**
 * User information channel
 */
const request = require('request');
const rp = require('request-promise');

const {db} = require('../model/db');
const config = require('../config/config.default');

// user instance
class user{
    constructor(){

    }

    login(event,arg){
        // Send message to remote server enroll 
        // Using new api call
        rp.post(config.server.url+config.api.user.login, {simple: false, resolveWithFullResponse: true,form: arg})
        .then((res,body)=>{
            // redirect to new link
            console.log(res.statusCode)
            console.log(res.headers['location'])
            let dbURL = res.headers['location'];
            rp.post(res.headers['location'],{form: arg})
                .then((body)=>{
                    // Body will be the result
                    let res = JSON.parse(body);
                    if(res.msg=="success"){
                        // Store in session 
                        config.store_user(arg.username)
                        // examine product key
                        console.log("Now starting the product key's examinate.")
                        let product_key = res.key;
                        rp.post(dbURL,{form: {username: arg.username, passwd: arg.passwd, key_id: res.key}})
                            .then((body) => {
                                let response = JSON.parse(body);
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
                                    // send error msg
                                    event.sender.send('login-error', response.msg)
                                }
                            })
                    }
                    else{
                        event.sender.send('login-error',res.msg);
                    }
                })
        }) 
    }

    api_config(event,arg){
        /**
         * @param arg.uname         username
         * @param arg.apikey        apikey (for current user)
         * @param arg.apisecret     apisecret (for current user)
         */
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
    }
}

module.exports = {
    user: new user()
}