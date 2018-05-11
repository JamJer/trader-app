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

