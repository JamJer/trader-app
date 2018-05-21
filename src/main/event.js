/**
 * Here is the Main Process running in nodejs
 * Then store the data into Other model
 */
const {ipcMain} = require('electron');
// FIXME: need to use https when this program release
const request = require('request');
const rp = require('request-promise');
// const strategist = require('../model/strategist');
const {user} = require('../model/user');
const {cmder} = require('../model/cmder');
const trader = require('../model/trader');
const trade_bot = require('../model/trade_bot');
const config = require('../config/config.default');


// ================================================== Trader bot channel ==================================================
/**
 * 
 */
/*ipcMain.on('updateBinanceCfg',trader.update_binance_cfg);
ipcMain.on('tradebotBuy', trader.buy);
ipcMain.on('tradebotSell', trader.sell);
ipcMain.on('tradebotUpdateMA',trader.update_ma);*/
ipcMain.on('trade_op',(event,arg)=>{
    trader.main_entry(event,arg);

    // debug, create bot instance, and then check out the message 
    let tbot = new trade_bot();
    tbot.start_by_url(".local/trade_strategy.yaml")
    trader.botID_queue.push({id: tbot.get_id(), instance: tbot})

    /*setInterval(()=>{
        trader.kill_all_bot();
    },20000)*/
})

// ================================================== User login channel ==================================================
/**
 * 
 */
ipcMain.on('ulogin',user.login);
ipcMain.on('api_config',user.api_config);

// ================================================== Control panel channel ==================================================
/**
 * Send message to (remote server)/(local) to fetch policy, or do other command
 */
ipcMain.on('status',cmder.status);
ipcMain.on('create',cmder.create);
ipcMain.on('list',cmder.list);
ipcMain.on('use',cmder.use);
ipcMain.on('pull',cmder.pull);
ipcMain.on('push',cmder.push);
ipcMain.on('purchase',cmder.purchase);

ipcMain.on('trade',cmder.trade);
ipcMain.on('debug',cmder.debug);

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