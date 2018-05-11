/**
 * This program is dealing with the trading command 
 * Using docker command style
 */

const request = require('request');
const config = require('../config/config.default');
const {db} = require('./db');

/**
 * cmder - command model for control panel 
 * 
 * @function list_remote
 * @function list_local
 * @function select 
 * @function buy
 * 
 */
class cmder{
    /**
     * Send request to remote server, to get all trading policies (or get the first N trading policies)
     * @param {*} event event object from ipcMain
     * @param {*} arg arg object (e.g data send from ipcRender), need to reference spec
     */
    list_remote(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
        // Send request back
        request.post(config.server.url+":"+config.server.port+"/ucmd/list_remote", {form: arg }, function (error, httpResponse, body){
            // Body will be the result
            let res = JSON.parse(body);
            // Send to render process
            event.sender.send('list_remote',res);
        });
    }
    
    /**
     * Send request to local, get all existing trading policies
     * Using "sqlite3" as database usage in client side
     * @param {*} event 
     * @param {*} arg 
     */
    list_local(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
        // fetching the existed policy from local
        db.list_exist_policy((err,policies)=>{
            //console.log(policies);
            // send data to render process
            event.sender.send('list_local',policies);
        })
    }
    
    /**
     * Select the policy from local (Usecase: when user want to change trader bot's behavior)
     * , searching the database from list_local
     * @param {*} event 
     * @param {*} arg 
     */
    select(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
    }
    
    /**
     * Purchase the policy from remote server
     * @param {*} event 
     * @param {*} arg 
     */
    buy(event,arg){
        console.log(`[Main Process] content: ${arg.cmd_body}`);
    }   
}

module.exports = {
    cmder: new cmder()
}