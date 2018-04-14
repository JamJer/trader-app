/**
 * Here is the Render Process running in frontend (webview)
 * 
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();

// User login
const ulogin = document.querySelector("#ulogin");
// Submit and store the file
ulogin.addEventListener("submit", function(event){
    // stop the form from submitting
    event.preventDefault();   
    // get the user input
    let username=document.getElementById('username').value;
    let passwd=document.getElementById('passwd').value;
    // send to ipcMain
    ipcRenderer.send('ulogin',{
        username,
        passwd
    });
});

// User login - reset event
const ulogin_reset = document.querySelector("#ulogin-reset");
ulogin_reset.addEventListener("click",function(event){
    console.log("Press!");
});

// Receive reply from remote server
ipcRenderer.on('login-success', (event, arg) => {
    console.log(arg) // 印出 "pong"
})
ipcRenderer.on('login-error', (event, arg) => {
    console.log(arg) // 印出 "pong"
})
/*
console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"
ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg) // 印出 "pong"
})
ipcRenderer.send('asynchronous-message', 'ping')*/