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
            /*let node = document.createElement("LI");
            let id = document.createTextNode(`${k}`);
            let desc = document.createTextNode(`${cmd_map[k].description}`);
            // Create Node (id - description)
            let spannode = document.createElement("SPAN"),desnode=document.createElement("SPAN");
            let btn = document.createElement("BUTTON"),desbtn=document.createElement("BUTTON");
            spannode.setAttribute("class","input-group-btn"),desnode.setAttribute("class","input-group-btn");
            btn.setAttribute("class","btn btn-info"),desbtn.setAttribute("class","btn btn-warning");
            btn.appendChild(id);
            desbtn.appendChild(desc);
            spannode.appendChild(btn);
            desnode.appendChild(desbtn);
            // Build node
            node.appendChild(spannode);  
            node.appendChild(desnode);*/
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