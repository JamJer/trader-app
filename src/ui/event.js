/**
 * Here is the Main Process running in nodejs
 * Then store the data into Other model
 */
const {ipcMain} = require('electron');

// Async Example
/*ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg)  // 印出 "ping"
    event.sender.send('asynchronous-reply', 'pong')
})*/
  
// Sync Example
/*ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg)  // 印出 "ping"
    event.returnValue = 'pong'
})*/

ipcMain.on('ulogin',(event,arg) => {
    console.log(arg);
})


exports.boardcast = function(win,channel,msg){
    win.webContents.send(channel,msg);
}