/**
 * Here is the Main Process running in nodejs
 * Then store the data into Other model
 */
const {ipcMain} = require('electron');
// FIXME: need to use https when this program release
const request = require('request');
const rp = require('request-promise');
const YAML = require('yamljs')
const fs = require('fs')
// const strategist = require('../model/strategist');
const {user} = require('../model/user');
const {cmder} = require('../model/cmder');
const {reconf} = require('../model/config');
const {editor} = require('../model/editor');
const {account} = require('../model/account');
const trader = require('../model/trader');
const trade_bot = require('../model/trade_bot');
var current_bot_id = "";
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
})

ipcMain.on('update_bot_status',(event,arg)=>{
    /**
     * Only need id 
     */
    let id_queue = [];
    trader.botID_queue.forEach((element)=>{
        id_queue.push({
            id: element.id,
            detail: element.instance.tradePolicy,
            symbol: element.instance.tradingData.symbol,
            tradeStatus: element.instance.currentStatus,
            trade_data: element.instance.get_log(),
            buyInfoLength: element.instance.buyInfo.length
        })
    })
    
    event.sender.send('receive_bot_status',{
        id_queue: id_queue
    });
})

ipcMain.on('create_bot',(event,arg)=>{
    /**
     * create bot instance, push into trader
     * 
     * Need to pass current user name!
     * After you login, your username will store in `config` object
     * 
     */

    // New Symbol
    let new_symbol = arg.symbol
    let policy_data = ""
    for(let i in config.userPolicyList){
        if(config.userPolicyList[i].policy_id == arg.policy_file){
            policy_data = config.userPolicyList[i]['content']
        }
    }
    let policy_obj = YAML.parse(policy_data)   
    policy_obj.symbol = new_symbol

    let tbot = new trade_bot(config.username);
    /** using the policy object to start robot */
    tbot.start_by_obj(policy_obj,arg.policy_file.split('.')[0])
    trader.botID_queue.push({id: tbot.get_id(), instance: tbot})

    // resend - receive_bot_status
    let id_queue = [];
    trader.botID_queue.forEach((element)=>{
        id_queue.push({
            id: element.id,
            detail: element.instance.tradePolicy,
            symbol: element.instance.tradingData.symbol,
            tradeStatus: element.instance.currentStatus,
            trade_data: element.instance.get_log(),
            buyInfoLength: element.instance.buyInfo.length
        })
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

    // resend - receive_bot_status
    let id_queue = [];
    trader.botID_queue.forEach((element)=>{
        id_queue.push({
            id: element.id,
            detail: element.instance.tradePolicy,
            symbol: element.instance.tradingData.symbol,
            tradeStatus: element.instance.currentStatus,
            trade_data: element.instance.get_log(),
            buyInfoLength: element.instance.buyInfo.length
        })
    })

    event.sender.send('receive_bot_status',{
        id_queue: id_queue
    });
})

ipcMain.on('kill_all_bot',(event,arg)=>{
    /**
     * terminate all bots
     */
    trader.kill_all_bot();
    event.sender.send("ready_for_log_out",{});
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
                trade_data: element.instance.get_log(),
                buyInfoLength: element.instance.buyInfo.length
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

ipcMain.on('sellAll_bot',(event,arg)=>{
    trader.botID_queue.forEach((element)=>{
        if(element.id == arg.id){
            element.instance.currentStatus = 'wait'
            element.instance.sell()
            
            let id_queue = [];
            setTimeout(function(){
                trader.botID_queue.forEach((element)=>{
                    id_queue.push({
                        id: element.id,
                        detail: element.instance.tradePolicy,
                        symbol: element.instance.tradingData.symbol,
                        tradeStatus: element.instance.currentStatus,
                        trade_data: element.instance.get_log(),
                        buyInfoLength: element.instance.buyInfo.length
                    })
                })
                event.sender.send('receive_bot_status',{
                    id_queue: id_queue
                });
            }, 2000); 
        }
    })
})

ipcMain.on('backtrack_bot',(event,arg)=>{
    console.log("Starting Backtracking....")
    let tbot = new trade_bot(config.username);
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

ipcMain.on('bot_fund_check_initial',(event,arg)=>{
    trader.bot_fund_check_proc()
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
ipcMain.on('userinfo',cmder.userinfo);
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
ipcMain.on('policy_data',editor.policy_data);
ipcMain.on('policy_delete',editor.policy_delete);

// ================================================== Config panel channel ==================================================
ipcMain.on('get_config',reconf.get_config);
ipcMain.on('set_config',reconf.set_config);
ipcMain.on('reset_config',reconf.reset);

// ================================================== Account panel channel ==================================================
ipcMain.on('get_user_account_info',account.accountInfo);
ipcMain.on('get_user_trades_info',account.accountTradeRecord);
ipcMain.on('get_user_key_info',account.accountGetUserKeyInfo);
ipcMain.on('get_user_fund_seg_val',account.accountGetUserFundSegVal);
ipcMain.on('save_user_fund_seg_val',account.accountSaveUserFundSegVal);
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