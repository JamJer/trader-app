/**
 * Here is the Main Process running in nodejs
 * Then store the data into Other model
 */
const {ipcMain} = require('electron');
// FIXME: need to use https when this program release
const request = require('request');
const strategist = require('../model/strategist');
const {cmder} = require('../model/cmd');
const server_url = "http://localhost",port=3000;

ipcMain.on('ulogin',(event,arg) => {
    // Send message to remote server enroll 
    // console.log(arg);
    request.post(server_url+":"+port+"/user/ulogin", {form: arg }, function (error, httpResponse, body){
        // Body will be the result
        let res = JSON.parse(body);
        console.log(res.msg);

        // if res.msg == OK, then represent this user is legal
        // FIXME: In debug mode, all msg will return OK, without compare user data
        // And when this user login success, it will get a unique key of this user to activate trade bot
        event.sender.send('login-success',res.product_key);
    });
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