/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with status.html only
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const path = require('path');
const url = require('url');

const utils = require('../utils/ui')

// send message to update table
ipcRenderer.send('update_bot_status',{})


/**
 * Create bot instance event
 */
let bot = document.querySelector('#bot')
bot.addEventListener("submit",function(event){
    // send event to ipcMain, create bot instance
    ipcRenderer.send('create_bot',{
        /** TODO: create bot with specified:
         * @param file_url
         * @param options (need to discuss)
         */
    })
})

/**
 * ipc render channel go here
 * 
 * @func receive_bot_status
 */
ipcRenderer.on('receive_bot_status',(event,arg)=>{
    console.log(arg)
    /**
     * using the arg to update the table - bot_status
     * 
     * @param arg.id_queue
     */

    // drop
	let list = document.getElementById("bot_status_table")
	while (list.firstChild) {
		list.removeChild(list.firstChild);
    }
    
    for(let i in arg.id_queue){
        let tr = document.createElement("TR");

        let td=document.createElement("TD")
        td.innerHTML = arg.id_queue[i]
        tr.appendChild(td)
        let detail=document.createElement("TD")
        detail.innerHTML = "[WIP]"
        tr.appendChild(detail)
        let btn_td=document.createElement("TD")
        let btn = document.createElement("BUTTON")
        btn.setAttribute("class","btn btn-danger")
        btn.innerHTML = "Kill Bot"
        // btn.setAttribute("onclick","call_kill(\""+arg.id_queue[i]+"\")");
        btn.addEventListener("click",function(event){
            console.log("Killing ... id=",arg.id_queue[i])
            // send the killing signal to event.js
            ipcRenderer.send('kill_bot',{
                id: arg.id_queue[i]
            })
        })
        btn_td.appendChild(btn)
        tr.appendChild(btn_td)

        // append into target
        document.getElementById("bot_status_table").appendChild(tr)
    }
})