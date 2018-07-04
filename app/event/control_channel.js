/**
 * ipcRenderer - control panel
 * 
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
var $ = require('jquery');
require('malihu-custom-scrollbar-plugin')($);
const path = require('path');
const url = require('url');
const cmd_map = require('../config/cmd_map');

// Sider bar event....
$(document).ready(function () {
    $("#sidebar").mCustomScrollbar({
         theme:"dark"
    });

    $('.overlay').on('click', function () {
        $('#sidebar').removeClass('active');
        $('.overlay').removeClass('active');
    });

    $('#sidebarCollapse').on('click', function () {
        // open or close navbar
        $('#sidebar').toggleClass('active');
        $('.overlay').toggleClass('active');
        // close dropdowns
        $('.collapse.in').toggleClass('in');
        // and also adjust aria-expanded attributes we use for the open/closed arrows
        // in our CSS
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    });

    $('#sb_dashboard').on('click', function () {
        alert("This page is still working on....")
        // Working on
    });
    $('#sb_status').on('click', function () {
        pageControl('status')
        // Working on
    });
    $('#sb_trade').on('click', function () {
        pageControl('trade')
        // Working on
    });
    $('#sb_backtrack').on('click', function () {
        pageControl('backtrack')
        // Working on
    });
    $('#sb_list_policy').on('click', function () {
        pageControl('list')
        // Working on
    });
    $('#sb_create_policy').on('click', function () {
        pageControl('create')
        // Working on
    });
    $('#sb_edit_policy').on('click', function () {
        pageControl('edit')
        // Working on
    });
    $('#sb_purchase_policy').on('click', function () {
        pageControl('purchase')
        // Working on
    });
    $('#sb_setting').on('click', function () {
        window.location.href="config.html"
        // Working on
    });
    $('#sb_help').on('click', function () {
        pageControl('help')
        // Working on
    });
    $('#sb_about').on('click', function () {
        alert("This page is still working on....")
        // Working on
    });
});

function pageControl(user_cmd){
    // split command
    let cmd_id=user_cmd.split(" ")[0];
    let cmd_body=user_cmd.split(" ")[1];

    // Check the command is valid or not
    if(cmd_map[cmd_id] == undefined){
        // Not found, display error 
        console.log("Display error");
        alert("Page Not found 404");
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
                // utils.create_block(cmd_map[k].placeholder,cmd_map[k].description,"success","cmd_display");
            }
        }
    }
}

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
     * @param arg.id
     * 
     */
    
    // create block
    // utils.create_block(title+" ID:"+arg.id,arg.msg,style,"cmd_display")

    // page change to trade.html
    // Enter next page - trade
    window.location.href="create.html";
})

ipcRenderer.on('list',(event,arg)=>{
    // console.log(arg);
    // Receive the data from database in main process
    if(arg.length != 0)
        for (var k in arg) {
            // Display message on it
            // Using bootstrap list group to illustrate the information
            // Link: https://v4-alpha.getbootstrap.com/components/list-group/#custom-content
            // utils.create_block(arg[k].trade_policy_id,arg[k].trade_policy_loc,"warning","cmd_display");
            console.log(arg[k].trade_policy_id+" "+arg[k].trade_policy_loc)
        }
    else{
        console.log("Not found")
        // utils.create_block("Not found","Please using `help` to list all available commands.","danger","cmd_display");
    }
})

ipcRenderer.on('use',(event,arg)=>{
    console.log(arg);
    // utils.create_block("Not found","Please using `help` to list all available commands.","danger","cmd_display");
})

ipcRenderer.on('pull',(event,arg)=>{
    console.log(arg);
    // utils.create_block("Not found","Please using `help` to list all available commands.","danger","cmd_display");
})

ipcRenderer.on('push',(event,arg)=>{
    console.log(arg);
    // utils.create_block("Not found","Please using `help` to list all available commands.","danger","cmd_display");
})

ipcRenderer.on('purchase',(event,arg)=>{
    console.log(arg);
    // utils.create_block("Not found","Please using `help` to list all available commands.","danger","cmd_display");
})

// Handle page change 
ipcRenderer.on('trade',(event,arg)=>{
    // page change to trade.html
    // Enter next page - trade
    window.location.href="trade.html";
})

// Handle page change 
ipcRenderer.on('backtrack',(event,arg)=>{
    // page change to backtrack.html
    // Enter next page - backtrack
    window.location.href="backtrack.html";
})

// Handle debug page 
ipcRenderer.on('debug',(event,arg)=>{
    // Enter debug page
    window.location.href="debug.html";
})