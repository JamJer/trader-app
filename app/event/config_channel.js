/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with config.html only
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const path = require('path');
const url = require('url');

// send the get_config signal 
ipcRenderer.send('get_config',{});

// submit event
// server block
let server = document.querySelector("#server");
server.addEventListener("submit",function(event){
    event.preventDefault();

    // fetch server 
    let url = document.getElementById("url").value
    let port = document.getElementById("port").value
    // fill trade info
    let apikey = document.getElementById("apikey").value
    let apisecret = document.getElementById("apisecret").value
    let recvwindow = document.getElementById("recvwindow").value


    ipcRenderer.send('set_config',{
        server:{
            url: url,
            port: port
        },
        trade:{
            binance_apiKey: apikey,
            binance_apiSecret: apisecret,
            binance_recvWindow: recvwindow
        }
    })
})

// trade block 
let trade = document.querySelector("#trade");
trade.addEventListener("submit",function(event){
    event.preventDefault();

    // fetch server 
    let url = document.getElementById("url").value
    let port = document.getElementById("port").value
    // fill trade info
    let apikey = document.getElementById("apikey").value
    let apisecret = document.getElementById("apisecret").value
    let recvwindow = document.getElementById("recvwindow").value


    ipcRenderer.send('set_config',{
        server:{
            url: url,
            port: port
        },
        trade:{
            binance_apiKey: apikey,
            binance_apiSecret: apisecret,
            binance_recvWindow: recvwindow
        }
    })
})

// reset
let reset = document.querySelector("#reset");
reset.addEventListener("submit",function(event){
    event.preventDefault();
    // send reset signal
    ipcRenderer.send('reset_config',{})

    // reload after 1 s
    setTimeout(()=>{
        // send get signal
        console.log("Reset!")
        ipcRenderer.send('get_config',{})
    },1000)
})

// receive the get_config 
ipcRenderer.on('receive_config',(event,arg)=>{
    /**
     * @param arg.trade
     * @param arg.server
     * @param arg.username
     */
    console.log(arg)
    // fill server info
    document.getElementById("url").value = arg.server.url;
    document.getElementById("port").value = arg.server.port;
    // fill trade info
    document.getElementById("apikey").value = arg.trade.binance_apiKey;
    document.getElementById("apisecret").value = arg.trade.binance_apiSecret;
    document.getElementById("recvwindow").value = arg.trade.binance_recvWindow;

})