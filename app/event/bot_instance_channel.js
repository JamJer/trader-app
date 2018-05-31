/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with bot_instance.html only
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const path = require('path');
const url = require('url');

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
    
})