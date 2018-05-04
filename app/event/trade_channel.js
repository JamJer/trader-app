/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with trade.html only
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const path = require('path');
const url = require('url');
const cmd_map = require('../config/cmd_map');

let config_binance = document.querySelector("#config_binance");
// Submit and store the file
config_binance.addEventListener("submit", function(event){
	// stop the form from submitting
    event.preventDefault();
	// get input value
	let apikey = document.getElementById('apikey').value;
	let apisecret = document.getElementById('apisecret').value;
	// clean input value
	document.getElementById('apikey').value = "";
	document.getElementById('apisecret').value = "";
	let username = localStorage.getItem("username");
	ipcRenderer.send('updateBinanceCfg',{
        apikey,
        apisecret,
		username
    });
});

let tradebot_buy = document.querySelector("#tradebot_buy");
tradebot_buy.addEventListener("submit", function(event){
	// stop the form from submitting
    event.preventDefault();
	// get input value
	
	
	let username = localStorage.getItem("username");
	ipcRenderer.send('tradebotBuy',{username});
});

let tradebot_sell = document.querySelector("#tradebot_sell");
tradebot_sell.addEventListener("submit", function(event){
	// stop the form from submitting
    event.preventDefault();
	// get input value
	
	
	let username = localStorage.getItem("username");
	ipcRenderer.send('tradebotSell',{username});
});

let tradebot_getma = document.querySelector("#tradebot_getma");
tradebot_getma.addEventListener("submit", function(event){
	// stop the form from submitting
    event.preventDefault();
	
	
	let maType = "7d";
	ipcRenderer.send('tradebotUpdateMA',{maType});
});

let cmd_block = document.querySelector("#cmd_block");
// Submit and store the file
cmd_block.addEventListener("submit", function(event){
    // stop the form from submitting
    event.preventDefault();
    // get the user input
    let user_cmd = document.getElementById('cmd').value;
    // clear cmd & cmd_display
    document.getElementById('cmd').value="";
    let display_entries = document.getElementById("cmd_display");
    while (display_entries.firstChild) {display_entries.removeChild(display_entries.firstChild);}
    // split command
    let cmd_id=user_cmd.split(" ")[0];
    let cmd_body=user_cmd.split(" ")[1];
    // mapping command to specify sender
    if(cmd_map[cmd_id].flag==1){
        console.log(`Found command: ${cmd_id}, with body: ${cmd_body}`)
        // send target command to main process
        ipcRenderer.send(cmd_id,{
            cmd_id,
            cmd_body
        });
    }
    else if(cmd_map[cmd_id].flag==0){
        // Create entries
        for (var k in cmd_map) {
            // Display message on it
            // Using bootstrap list group to illustrate the information
            // Link: https://v4-alpha.getbootstrap.com/components/list-group/#custom-content
            let node=document.createElement("A")
            node.href="#"
            node.setAttribute("class","list-group-item list-group-item-action flex-column align-items-start")
            let wrapper=document.createElement("DIV")
            wrapper.setAttribute("class","d-flex w-100 justify-content-between");
            let cmd_title=document.createElement("H5");
            cmd_title.setAttribute("class","mb-1")
            cmd_title.innerHTML=k;
            let cmd_desc=document.createElement("P");
            cmd_desc.setAttribute("class","mb-1")
            cmd_desc.innerHTML=cmd_map[k].description;
            wrapper.appendChild(cmd_title)
            node.appendChild(wrapper)
            node.appendChild(cmd_desc)
            // Append into display block
            document.getElementById("cmd_display").appendChild(node);
        }
    }
});

// ================================= Receive messages from user command =================================
ipcRenderer.on('list_remote',(event,arg)=>{
    console.log(arg);
})

ipcRenderer.on('list_local',(event,arg)=>{
    // console.log(arg);
    // Receive the data from database in main process
    for (var k in arg) {
        // Display message on it
        // Using bootstrap list group to illustrate the information
        // Link: https://v4-alpha.getbootstrap.com/components/list-group/#custom-content
        let node=document.createElement("A")
        node.href="#"
        node.setAttribute("class","list-group-item list-group-item-action flex-column align-items-start")
        let wrapper=document.createElement("DIV")
        wrapper.setAttribute("class","d-flex w-100 justify-content-between");
        let cmd_title=document.createElement("H5");
        cmd_title.setAttribute("class","mb-1")
        cmd_title.innerHTML=arg[k].trade_policy_id;
        let cmd_desc=document.createElement("P");
        cmd_desc.setAttribute("class","mb-1")
        cmd_desc.innerHTML=arg[k].trade_policy_loc;
        wrapper.appendChild(cmd_title)
        node.appendChild(wrapper)
        node.appendChild(cmd_desc)
        // Append into display block
        document.getElementById("cmd_display").appendChild(node);
    }
})

ipcRenderer.on('select',(event,arg)=>{
    console.log(arg);
})

ipcRenderer.on('buy',(event,arg)=>{
    console.log(arg);
})