/**
 * Main Process:
 * This file is the configuration of Trader App 
 */

const jsfs = require("jsonfile")
const path = require("path")

class config{
    constructor(){
        this.reload();
        this.userFundSegVal = 1000 // 基本金額分割額度1000份
        this.buyAvailiable = true
        this.logged = false
    }

    store_user(user,title){
        this.username = user;
        this.usertitle = title;
        this.logged = true
    }

    store_user_key_info(data){
        this.userKeyInfo = data
    }

    store_fund_seg_val(val){
        this.userFundSegVal = val
    }

    store_buy_availiable(bool){
        this.buyAvailiable = bool
    }

    store_user_policy_list(policy_list){
        this.userPolicyList = policy_list
    }
    
    store_buy_count(val){
        this.buyCount = val
    }

    reload(){
        console.log(__dirname);
        let obj = jsfs.readFileSync(path.join(__dirname,"settings.json"));
        let api = jsfs.readFileSync(path.join(__dirname,"api.json"))
        this.server = obj.server;
        this.trade = obj.trade;
        this.policy = obj.policy;
        // assign api
        this.api = api
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