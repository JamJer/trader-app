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
const {reconf} = require('../model/config');
const {editor} = require('../model/editor');
const trader = require('../model/trader');
const trade_bot = require('../model/trade_bot');
var current_bot_id = "";
const config = require('../config/config.default');

// localStore
const trade_record_func = require('../model/localStore/bot_trade_record.js')

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

    // 如果是交易的動作才新增機器人
    if(arg.cmd == "trade") {
        let tbot = new trade_bot();
        tbot.start_by_url(".local/trade_strategy.yaml")
        trader.botID_queue.push({id: tbot.get_id(), instance: tbot})
    }

    /*setInterval(()=>{
        trader.kill_all_bot();
    },20000)*/
})

ipcMain.on('update_bot_status',(event,arg)=>{
    /**
     * Only need id 
     */
    let id_queue = [];
    trader.botID_queue.forEach((element)=>{
        id_queue.push(element.id)
    })

    event.sender.send('receive_bot_status',{
        id_queue: id_queue
    });
})

ipcMain.on('create_bot',(event,arg)=>{
    /**
     * create bot instance, push into trader
     */
    let tbot = new trade_bot();
    /** using the arg.url as file */
    tbot.start_by_url(arg.url)
    trader.botID_queue.push({id: tbot.get_id(), instance: tbot})

    // Create local storage of thsi bot 
    trade_record_func.initailizeLocalBotRecord(tbot.get_id())

    // resend - receive_bot_status
    let id_queue = [];
    trader.botID_queue.forEach((element)=>{
        id_queue.push(element.id)
    })

    event.sender.send('receive_bot_status',{
        id_queue: id_queue
    });
})

ipcMain.on('kill_bot',(event,arg)=>{
    /**
     * terminate bot instance by id
     * 
     * @param arg.id
     */
    trader.kill_bot(arg.id)

    // Delete local storage of this bot 
    trade_record_func.deleteBotRecordFromLocal(arg.id)

    // resend - receive_bot_status
    let id_queue = [];
    trader.botID_queue.forEach((element)=>{
        id_queue.push(element.id)
    })

    event.sender.send('receive_bot_status',{
        id_queue: id_queue
    });
})

ipcMain.on('edit_bot',(event,arg)=>{
    // enter into bot_instance page
    /**
     * store bot id
     * 
     * @param arg.id
     */
    current_bot_id = arg.id;

    // change page
    event.sender.send("bot_instance_start",{});
})

ipcMain.on('get_bot',(event,arg)=>{
    // send current_bot_id's status to "receive_bot" channel
    trader.botID_queue.forEach((element)=>{
        if(element.id == current_bot_id){
            // send instance to frontend
            console.log("Find current bot: "+current_bot_id)
            // console.log("Find bot tradingData: ")
            // console.dir(element.instance.tradingData)
            // send current status 
            event.sender.send("receive_bot",{
                id: current_bot_id,
                ma: element.instance.tradingData.ma,
                symbol: element.instance.tradingData.symbol,
                trade_data: element.instance.get_log()
            })
        }
    })
})

ipcMain.on('set_bot',(event,arg)=>{
    trader.botID_queue.forEach((element)=>{
        if(element.id == current_bot_id){
            // reload the config, and restart the bot
            element.instance.change_all(arg.symbol,arg.ma)
            // this function will restart the bot instance
            return;
        }
    })
})

ipcMain.on('backtrack_bot',(event,arg)=>{
    console.log("Starting Backtracking....")
    let tbot = new trade_bot();
    tbot.backTrackTest(arg.yaml_string,arg.start_time,arg.end_time).then((data) => {
        console.log("---Backtracking End---")
        event.sender.send("receive_backtrack_bot",{
            res: data
        })
    }).catch(err => {
        event.sender.send("receive_backtrack_bot",{
            res: err
        })
    });
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
ipcMain.on('backtrack',cmder.backtrack);
ipcMain.on('debug',cmder.debug);

// ================================================== Editor channel ==================================================
ipcMain.on('policy_list',editor.policy_list);
ipcMain.on('policy_save',editor.policy_save);
ipcMain.on('policy_delete',editor.policy_delete);

// ================================================== Config panel channel ==================================================
ipcMain.on('get_config',reconf.get_config);
ipcMain.on('set_config',reconf.set_config);
ipcMain.on('reset_config',reconf.reset);


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