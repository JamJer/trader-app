/**
 * Config channel
 * 
 * Use to configure the setting of current app.
 * 
 */
// configuration
const config = require("../config/config.default");

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
    }

    reset(){
        // reset signal
        config.reset();
    }
}

module.exports = {
    reconf: new reconfig()
}