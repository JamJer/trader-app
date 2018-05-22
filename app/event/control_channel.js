/**
 * ipcRenderer - control panel
 * 
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const path = require('path');
const url = require('url');
const cmd_map = require('../config/cmd_map');
// utils
const utils = require('../utils/ui');


// Create first 
utils.create_block("Welcome!","Please using `help` to list all available commands.","info","cmd_display");

// fetch block -> cmd_block
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

    // Check the command is valid or not
    if(cmd_map[cmd_id] == undefined){
        // Not found, display error 
        console.log("Display error");
        utils.create_block("Not found","Please using `help` to list all available commands.","danger","cmd_display");
        return;
    }
    else{
        // mapping command to specify sender
        if(cmd_map[cmd_id].flag==1){
            console.log(`Found command: ${cmd_id}, with body: ${cmd_body}`)
            // send target command to main process
            /**
             * using cmd_id to mapping the command into ipc channel (by cmd_map)
             */
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
                utils.create_block(cmd_map[k].placeholder,cmd_map[k].description,"success","cmd_display");
            }
        }
    }
    
});


// ================================= Receive messages from user command =================================
ipcRenderer.on('status',(event,arg)=>{
    // console.log(arg);
    // page change to status.html
    // Enter next page - status
    window.location.href="status.html";
    // utils.create_block("Not found","Please using `help` to list all available commands.","danger","cmd_display");
})

ipcRenderer.on('create',(event,arg)=>{
    console.log(arg);
    /**
     * @param arg.err
     * @param arg.msg
     * @param arg.id
     */
    let title = (arg.err == 0)?"Success!":"Failure!"
    let style = (arg.err == 0)?"success":"danger"
    
    // create block
    utils.create_block(title+" ID:"+arg.id,arg.msg,style,"cmd_display")
})

ipcRenderer.on('list',(event,arg)=>{
    // console.log(arg);
    // Receive the data from database in main process
    if(arg.length != 0)
        for (var k in arg) {
            // Display message on it
            // Using bootstrap list group to illustrate the information
            // Link: https://v4-alpha.getbootstrap.com/components/list-group/#custom-content
            utils.create_block(arg[k].trade_policy_id,arg[k].trade_policy_loc,"warning","cmd_display");
        }
    else{
        utils.create_block("Not found","Please using `help` to list all available commands.","danger","cmd_display");
    }
})

ipcRenderer.on('use',(event,arg)=>{
    console.log(arg);
    utils.create_block("Not found","Please using `help` to list all available commands.","danger","cmd_display");
})

ipcRenderer.on('pull',(event,arg)=>{
    console.log(arg);
    utils.create_block("Not found","Please using `help` to list all available commands.","danger","cmd_display");
})

ipcRenderer.on('push',(event,arg)=>{
    console.log(arg);

    utils.create_block("Not found","Please using `help` to list all available commands.","danger","cmd_display");
})

ipcRenderer.on('purchase',(event,arg)=>{
    console.log(arg);

    utils.create_block("Not found","Please using `help` to list all available commands.","danger","cmd_display");
})

// Handle page change 
ipcRenderer.on('trade',(event,arg)=>{
    // page change to trade.html
    // Enter next page - trade
    window.location.href="trade.html";
})

// Handle debug page 
ipcRenderer.on('debug',(event,arg)=>{
    // Enter debug page
    window.location.href="debug.html";
})