/**
 * Config channel
 * 
 * Use to configure the setting of current app.
 * 
 */
// configuration
const config = require("../config/config.default");
const {db} = require('../model/db');

class reconfig{
    constructor(){
        
    }

    get_config(event,arg){
        // send config to frondend
        event.sender.send("receive_config",config);
    }

    set_config(event,arg){
        // set server 
        config.set_server(arg.server);
        // set trade 
        config.set_trade(arg.trade);
        // update 
        db.store_api_ks(config.username,arg.trade.binance_apiKey,arg.trade.binance_apiSecret,
            (err,msg)=>{
                if(err){
                    console.error("Error when api config...");
                    console.log(err);
                }
                else{
                    console.log("Store your new binance API info!")
                    // and then write back
                    config.record_trade();
                    // send success signal
                    event.sender.send("api_config_success",{})
                }
            })
    }

    reset(){
        // reset signal
        config.reset();
    }
}

module.exports = {
    reconf: new reconfig()
}