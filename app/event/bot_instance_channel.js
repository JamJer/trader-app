/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with bot_instance.html only
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const os = require('os');
const fs = require('fs');
const path = require('path');
const url = require('url');
const file_ext = ".ect";
// Global var
var logger = null;

// send signal to fetch current bot status
ipcRenderer.send("get_bot",{});

// receive current bot status
ipcRenderer.on("receive_bot",(event,arg)=>{
    /**
     * @param id
     * @param ma
     * @param symbol
     */
    console.log(arg)

    // TODO:
    // Using these 3 element to render the bot_instance.html
    // Also set the edit panel, let user can edit the parameter of these parameter

    // FIXME: 
    // Get the streaming log from bot instance
    // Warning, current tick need to sync with the update rate in bot_instnace.js
    setInterval(function(){
        logger = fs.createReadStream(path.join(os.tmpdir(),arg.id+file_ext),'UTF8')
        logger.on('readable',function(){
            // TODO: using textarea to display it!
            console.log(logger.read())
        })
        logger.on('error',function(err){
            console.log(`[Bot][Error] streaming error. error code: ${err}`)
        })
    },10000)
    
    // TODO: (Long-term goal)
    // 獲利曲線 UI（該 bot 的獲利曲線，呈獻其運行到目前的收益情況）
    // 詳細可以參考後端程式碼： src/model/trade_bot.js 的實作

})


/**
 * function send the edited options to backend, let the bot change its behavior
 * 
 * @function send_changes
 */
function send_changes(id,new_ma,new_symbol){
    /**
     * @param id (optional) 可不放
     * @param ma
     * @param symbol
     */
    ipcRenderer.send("set_bot",{
        id: id,
        ma: new_ma,
        symbol: new_symbol
    })

    // can go back to status page.
    window.location.href="status.html";
}