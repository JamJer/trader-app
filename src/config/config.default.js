/**
 * Main Process:
 * This file is the configuration of Trader App 
 */

const jsfs = require("jsonfile")
const path = require("path")

class config{
    constructor(){
        this.reload();
    }

    store_user(user){
        this.username = user;
    }

    reload(){
        console.log(__dirname);
        let obj = jsfs.readFileSync(path.join(__dirname,"settings.json"));
        this.server = obj.server;
        this.trade = obj.trade;
        this.policy = obj.policy;
        // reset default 
        this.default = {
            server: this.server,
            trade: this.trade
        }
    }

    record_trade(){
        let obj = jsfs.readFileSync(path.join(__dirname, "settings.json"))
        obj.trade = this.trade;
        // write back this user's api config
        jsfs.writeFileSync(path.join(__dirname,"settings.json"),obj);
    }

    set_server(server_obj){
        this.server = server_obj;
    }

    set_trade(trade_obj){
        this.trade = trade_obj;
    }

    reset(){
        this.server = this.default.server;
        this.trade = this.default.trade;
    }
}

const conf = new config();
module.exports = conf