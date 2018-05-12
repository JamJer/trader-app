/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with trade.html only
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const path = require('path');
const url = require('url');

/**
 * Need to config key 
 */
let trade_op = document.querySelector('#trade_op')
trade_op.addEventListener("submit",function(event){
	event.preventDefault();
	// console.log(document.activeElement.getAttribute('value'));
	switch(document.activeElement.getAttribute('value')){
		case "sell":
			// send sell command 
			console.log(document.getElementById('sell').value);
			ipcRenderer.send('trade_op',{
				cmd: "sell",
				coin: document.getElementById('cointype').value,
				val: document.getElementById('sell').value
			});
			break;
		case "buy":
			// send buy command 
			console.log(document.getElementById('buy').value);
			ipcRenderer.send('trade_op',{
				cmd: "buy",
				coin: document.getElementById('cointype').value,
				val: document.getElementById('buy').value
			});
			break;
		case "close":
			// close today trade
			ipcRenderer.send('trade_op',{
				cmd: "close",
				val: null
			});
			break;
	}
})

/**
 * ipc Render channel go here
 * 
 * @func settlement
 */
ipcRenderer.on('settlement',(event,arg)=>{
	console.log(arg);
	sell.push(arg.total_sell);
	buy.push(arg.total_buy);
	income.push(arg.total_sell-arg.total_buy);
	chart.load({
		columns: [
			sell,
			buy,
			income
		]
	});

	event.sender.send('trade_op',{
		cmd: 'reset',
		val: null
	});
})
/*let config_binance = document.querySelector("#config_binance");
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
});*/

/**
 * C3 chart 
 */
// FIXME:
var sell = ['sell', 30, 200, 100, 400, 150, 250],
	buy = ['buy', 50, 20, 10, 40, 15, 25],
	income = ['income', -20,180,90,360,135,225]

var chart = c3.generate({
    bindto: '#chart',
    data: {
      columns: [
        sell,
		buy,
		income
      ],
	  types: {
		  income: 'bar' // ADD
	  }
	},
	regions: [
        {axis: 'y', end: 0, class: 'negative'},
    ]
});