/**
 * This program is dealing with the trading command 
 * Using docker command style
 */

const rs = require('randomstring');
const request = require('request');
const config = require('../config/config.default');
const {db} = require('./db');

/**
 * cmder - command model for control panel 
 * 
 * @function status
 * @function create 
 * @function list 
 * @function use 
 * @function pull
 * @function push 
 * @function purchase 
 * @function trade 
 * @function debug
 * 
 */
class cmder{
    /**
     * Send request to remote server, to get all trading policies (or get the first N trading policies)
     * @param {*} event event object from ipcMain
     * @param {*} arg arg object (e.g data send from ipcRender), need to reference spec
     */
    status(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
        event.sender.send('status',{});
        /*request.post(config.server.url+":"+config.server.port+"/ucmd/", {form: arg }, function (error, httpResponse, body){
            // Body will be the result
            let res = JSON.parse(body);
            // Send to render process
            event.sender.send('status',res);
        });*/
    }

    /**
     * Open Editor to create self-defined trading policy
     * @param {*} event event object from ipcMain
     * @param {*} arg arg object (e.g data send from ipcRender), need to reference spec
     */
    create(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
        
        // FIXME - using the real func to create policy
        let trade_id = rs.generate();
        db.add_new_policy(trade_id,`/tmp/${trade_id}.json`,(err,msg)=>{
            console.log(msg);
            // send message to frontend
            event.sender.send('create',{
                err: err,
                msg: msg,
                id: trade_id
            });
        })
    }
    
    /**
     * Send request to local, get all existing trading policies
     * Using "sqlite3" as database usage in client side
     * @param {*} event 
     * @param {*} arg 
     */
    list(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
        // fetching the existed policy from local
        db.list_exist_policy((err,policies)=>{
            //console.log(policies);
            // send data to render process
            event.sender.send('list',policies);
        })
    }
    
    /**
     * Use the policy from local (Usecase: when user want to change trader bot's behavior)
     * , searching the database from local sqlite3
     * @param {*} event 
     * @param {*} arg 
     */
    use(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
    }
    
    /**
     * 
     * Pull the user's status(trading policies, privilege) from remote server
     * @param {*} event
     * @param {*} arg
     * 
     */
    pull(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
    }

    /**
     * 
     * Push the user's self-defined trading policy to remote server (For sell, or maintain)
     * @param {*} event
     * @param {*} arg
     * 
     */
    push(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
    }

    /**
     * Purchase the policy from remote server
     * @param {*} event 
     * @param {*} arg 
     */
    purchase(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
    }

    /**
     * Enter manual control mode 
     * @param {*} event 
     * @param {*} arg 
     */
    trade(event,arg){
        // page change
        event.sender.send('trade',{name: 'trade'});
    }

    /**
     * Debug mode
     */
    debug(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
        // page change
        event.sender.send('debug',{name: 'debug'});
    }
}

module.exports = {
    cmder: new cmder()
}