/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with index.html only
 */
const { remote, ipcRenderer } = require('electron');
const shell = require('electron').shell;
const currentWindow = remote.getCurrentWindow();
const path = require('path');
const url = require('url');

// User login
let ulogin = document.querySelector("#ulogin");
// Submit and store the file
ulogin.addEventListener("submit", function(event){
    // stop the form from submitting
    event.preventDefault();
    if(document.getElementById('username').value == ''){
        alert("帳號不得為空")
        return
    }
    if(document.getElementById('passwd').value == ''){
        alert("密碼不得為空")
        return
    }
    // get the user input
    let username=document.getElementById('username').value;
    let passwd=document.getElementById('passwd').value;
    // lock the input & button
    document.getElementById('username').disabled=true;
    document.getElementById('passwd').disabled=true;
    // Logining mask activate
    loadingBt(true);
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
// User login - skip event
let uskip = document.querySelector("#skip");
uskip.addEventListener("click",function(event){
    console.log(__dirname);
    // go to command line mode
    // Enter next page - control panel
    window.location.href="status.html";
});

// Config event
let uconfig = document.querySelector("#config");
uconfig.addEventListener("click",function(event){
    console.log(__dirname);
    // go to command line mode
    // Enter next page - config
    window.location.href="config.html";
});

// Sign up event
let uSignUp = document.querySelector("#uSignUp");
uSignUp.addEventListener("click",function(event){
    event.preventDefault();
    shell.openExternal("https://ectrader-home.herokuapp.com/Register");
});


// Receive reply from remote server
ipcRenderer.on('login-success', (event, arg) => {
    console.log(arg)
    loadingBt(false) 
    // login success
    // unlock the input & button
    document.getElementById('username').disabled=false;
    document.getElementById('passwd').disabled=false;
	// store username to localstorage
	let username = document.getElementById('username').value;
	localStorage.setItem('username', username);
    // Enter next page - control panel
    window.location.href="status.html";
})
ipcRenderer.on('login-error', (event, arg) => {
    console.log(arg)
    loadingBt(false) 
    // login error
    // unlock the input & button
    document.getElementById('username').disabled=false;
    document.getElementById('passwd').disabled=false;
    alert(arg)
})

function loadingBt(isloading){
    if(isloading){
        $.busyLoadFull("show", {
            text: "Logining ...",
            fontawesome: "fa fa-cog fa-w-16 fa-spin fa-lg fa-5x",
            fontSize: "3rem",
            animation: "fade"
        });
    }else{
        $.busyLoadFull("hide");
    }
}
/*
console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"
ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg) // 印出 "pong"
})
ipcRenderer.send('asynchronous-message', 'ping')*/

