/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with trade.html only
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const path = require('path');
const url = require('url');

const utils = require('../utils/ui')

// EChart initialization
var echarts = require('echarts');
// EChart dark theme
const dark = require('../lib/js/dark')
// JQuery
var $  = require( 'jquery' );
// DataTable
var dt = require( 'datatables.net' )();


// FIXME: using the real data from sqlite3
let quantity=['quantity'],profit=['profit']

// EChart initialization
var chart_dom = document.querySelector('#chart')
var eChart = echarts.init(chart_dom,'dark');
option = null;

// DataTable initialization
dataSet = [];
var tradelogTable = $('#trade_log_table').DataTable( {
        "autoWidth": true,
        data: dataSet,
        columns: [
            { title: "ID" },
            { title: "Date" },
            { title: "Market" },
            { title: "Quantity." },
            { title: "賣出價格" },
            { title: "買入價格" },
            { title: "獲利" },
            { title: "State" }
        ]
} );

/**
 * C3 chart - For displaying trading history
 * 
 */
// var chart = c3.generate({
//     bindto: '#chart',
//     data: {
// 	  columns: [ quantity,profit ],
// 	  axes: {
// 		  quantity: 'y',
// 		  profit: 'y2'
// 	  }
// 	},
// 	regions: [
//         {axis: 'y', end: 0, class: 'negative'}, /** distinguish negative value from positive */
// 	],
// 	axis: {
// 		y2: {
// 			show: true
// 		}
// 	}
// });

// send the message to update chart
ipcRenderer.send('trade_op',{
	cmd: "trade_log"
})

/**
 * Need to config key 
 */
let trade_op = document.querySelector('#trade_op')
trade_op.addEventListener("submit",function(event){
	event.preventDefault();
	// console.log(document.activeElement.getAttribute('value'));
	switch(document.activeElement.getAttribute('value')){
		case "trade":
			// close today trade
			ipcRenderer.send('trade_op',{
				cmd: "trade",
				market: document.getElementById('cointype').value,
                // Using random float to generate trade record.
                quantity: Math.random().toFixed(3),
                price_sell: (Math.random()*10).toFixed(3),
                price_buyin:(Math.random()*10).toFixed(3)
				// quantity: document.getElementById('quantity').value,
				// price_sell: document.getElementById('price_sell').value,
				// price_buyin: document.getElementById('price_buyin').value
			});
			break;
	}
})

/**
 * ipc Render channel go here
 * 
 * @func update_trading_chart
 */
ipcRenderer.on('update_trading_chart',(event,arg)=>{
	console.log(arg);

	let quantity=['quantity'],profit = ['profit'];
    let xAxisArr=[]; // For chart xAxis data
	// drop
	// let list = document.getElementById("trade_log_table")
	// while (list.firstChild) {
	// 	list.removeChild(list.firstChild);
	// }
	
    // Clear DataTable
    tradelogTable.clear();
	// Parsing the data from 
	for(let i in arg.rows){
		quantity.push(arg.rows[i].quantity)
		profit.push(arg.rows[i].profit)
		// And then add element into table
		let merge_arr = [
			arg.rows[i].trade_id,
			arg.rows[i].trade_date,
			arg.rows[i].market,
			arg.rows[i].quantity,
			arg.rows[i].price_sell,
			arg.rows[i].price_buyin,
			arg.rows[i].profit,
			arg.rows[i].state
		]
		// utils.insert_element_into_table(merge_arr,"trade_log_table")
        tradelogTable.row.add(merge_arr).draw(); // Push table data into Datatable
	}
    
    // Generate chart axis data
	for (i = 0; i < quantity.length; i++) { 
		xAxisArr.push(i+1);
    }
    
	// Setting option variable for eChart
    option = {
    title: {
        text: 'Trading Chart',
        subtext: ''
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data:['Profit','Quantity']
    },
    toolbox: {
        show: true,
        feature: {
            dataZoom: {
                yAxisIndex: 'none'
            },
            dataView: {readOnly: false},
            magicType: {type: ['line', 'bar']},
            restore: {},
            saveAsImage: {}
        }
    },
    xAxis:  {
        type: 'category',
        boundaryGap: false,
        data: xAxisArr
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: '{value}'
        }
    },
    series: [
        {
            name:'Profit',
            type:'line',
            data: profit,
            markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            },
            markLine: {
                data: [
                    {type: 'average', name: '平均值'}
                ]
            }
        },
        {
            name:'Quantity',
            type:'line',
            data: quantity,
            markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            },
            markLine: {
                data: [
                    {type: 'average', name: '平均值'}
                ]
            }
        }
    ]
};
	// reload the eChart
	eChart.setOption(option, true);
})

// Window resizing for eChart
window.onresize = function() {
  eChart.resize();
}; 

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