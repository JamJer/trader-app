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
const utils = require('../utils/control_channel');

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
        utils.create_block("Not found","Please using `help` to list all available commands.","cmd_display");
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
                utils.create_block(k,cmd_map[k].description,"cmd_display");
            }
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
        utils.create_block(arg[k].trade_policy_id,arg[k].trade_policy_loc,"cmd_display");
    }
})

ipcRenderer.on('select',(event,arg)=>{
    console.log(arg);
})

ipcRenderer.on('buy',(event,arg)=>{
    console.log(arg);
})