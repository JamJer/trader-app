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
        // console.log(arg);
        rp.post(config.server.url+":"+config.server.port+"/user/login", {simple: false, resolveWithFullResponse: true,form: arg})
        .then((res,body)=>{
            // redirect to new link
            rp.post(res.headers['location'],{form: arg})
                .then((body)=>{
                    // Body will be the result
                    let res = JSON.parse(body);
                    //
                    if(res.msg=="success"){
                        // Store
                        db.store_product_key(arg.username,arg.passwd,res.key,
                            (err,msg)=>{
                                if(err)
                                    console.log(err);
                                // Send back
                                // if res.msg == OK, then represent this user is legal
                                // FIXME: In debug mode, all msg will return OK, without compare user data
                                // And when this user login success, it will get a unique key of this user to activate trade bot
                                event.sender.send('login-success',res.key);
                                
                                // trader.prepare(arg.username);
                            });
                    }
                    else{
                        event.sender.send('login-error',res.msg);
                    }
                })
        }) 
    }
}

module.exports = {
    user: new user()
}