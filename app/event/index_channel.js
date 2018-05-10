/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with index.html only
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const path = require('path');
const url = require('url');

// User login
let ulogin = document.querySelector("#ulogin");
// Submit and store the file
ulogin.addEventListener("submit", function(event){
    // stop the form from submitting
    event.preventDefault();
    // get the user input
    let username=document.getElementById('username').value;
    let passwd=document.getElementById('passwd').value;
    // lock the input & button
    document.getElementById('username').disabled=true;
    document.getElementById('passwd').disabled=true;
    // show loader bar
    document.getElementById('ulogin-loader').setAttribute("style","");
    // send to ipcMain
    ipcRenderer.send('ulogin',{
        username,
        passwd
    });
});

// User login - reset event
let ulogin_reset = document.querySelector("#ulogin-reset");
ulogin_reset.addEventListener("click",function(event){
    console.log(__dirname);
    // set all value to default
    document.getElementById('username').value="";
    document.getElementById('passwd').value="";
});

// Receive reply from remote server
ipcRenderer.on('login-success', (event, arg) => {
    console.log(arg) 
    // login success
    // unlock the input & button
    document.getElementById('username').disabled=false;
    document.getElementById('passwd').disabled=false;
    // hide loader bar
    document.getElementById('ulogin-loader').setAttribute("style","display:none");
	// store username to localstorage
	let username = document.getElementById('username').value;
	localStorage.setItem('username', username);
    // Enter next page - control panel
    window.location.href="control_panel.html";
})
ipcRenderer.on('login-error', (event, arg) => {
    console.log(arg) 
    // login error
    // unlock the input & button
    document.getElementById('username').disabled=false;
    document.getElementById('passwd').disabled=false;
    // hide loader bar
    document.getElementById('ulogin-loader').setAttribute("style","display:none");
})
/*
console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"
ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg) // 印出 "pong"
})
ipcRenderer.send('asynchronous-message', 'ping')*/