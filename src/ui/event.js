/**
 * Here is the Main Process running in nodejs
 * Then store the data into Other model
 */
const {ipcMain} = require('electron');
// FIXME: need to use https when this program release
const request = require('request');
const rp = require('request-promise');
const strategist = require('../model/strategist');
const {cmder} = require('../model/cmder');
const {db} = require('../model/db');
const config = require('../config/config.default');

ipcMain.on('ulogin',(event,arg) => {
    // Send message to remote server enroll 
    // console.log(arg);
    rp.post(config.server_url+":"+config.port+"/user/login", {simple: false, resolveWithFullResponse: true,form: arg})
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
                            });
                    }
                    else{
                        event.sender.send('login-error',res.msg);
                    }
                })
        }) 
})

// Send message to (remote server)/(local) to fetch policy, or do other command
ipcMain.on('list_remote',cmder.list_remote);
ipcMain.on('list_local',cmder.list_local);
// Send message to local to fetch policy
ipcMain.on('select',cmder.select);
// Send message to remote server to buy policy
ipcMain.on('buy',cmder.buy);

// Async Example
/*ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg)  // 印出 "ping"
    event.sender.send('asynchronous-reply', 'pong')
})*/
  
// Sync Example
/*ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg)  // 印出 "ping"
    event.returnValue = 'pong'
})

exports.boardcast = function(win,channel,msg){
    win.webContents.send(channel,msg);
}*/