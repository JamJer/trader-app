/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with personal.html only
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const Binance = require('binance-api-node').default;
const $  = require( 'jquery' );
const dt = require( 'datatables.net' )();

var user_balance_table
var user_trades
var symbolList = $('#symbol-list')

// DataTable initialization
user_balance_table = $('#user_balance').DataTable( {
        "autoWidth": true,
        "paging": true,
        "pageLength": 5,
        "lengthMenu": [[5, 10, 20, -1], [5, 10, 20, "Todos"]],
        fixedColumns: false,
        autoFill: false,
        data: [],
        columns: [
            { title: "ASSET" },
            { title: "FREE" },
            { title: "LOCKED"}
        ]
} );

user_trades = $('#user_trades').DataTable( {
        "autoWidth": true,
        "paging": true,
        fixedColumns: false,
        autoFill: false,
        data: [],
        columns: [
            { title: "ID" },
            { title: "ORDER ID" },
            { title: "PRICE"},
            { title: "QTY"},
            { title: "COMMISSION"},
            { title: "COMMISSION ASSET"},
            { title: "TIME"},
            { title: "IS BUYER"},
            { title: "IS MAKER"},
            { title: "IS BEST MATCH"}
        ]
} );

$( document ).ready(function() {
	initSymbolList()
    ipcRenderer.send("get_user_account_info",{})
});

ipcRenderer.on("recieve_account_info",(event,arg)=>{
	$('#maker-cms').text(arg.acc_data['makerCommission'])
	$('#taker-cms').text(arg.acc_data['takerCommission'])
	$('#seller-cms').text(arg.acc_data['sellerCommission'])
	$('#can-trade').text(arg.acc_data['canTrade'])
	$('#can-withdraw').text(arg.acc_data['canWithdraw'])
	$('#can-deposit').text(arg.acc_data['canDeposit'])
	$('#updateTime').text(new Date(arg.acc_data['updateTime']))
 
    user_balance_table.clear().draw()
    for(let i in arg.acc_data['balances']){
    	let insert_row = [arg.acc_data['balances'][i]['asset'],arg.acc_data['balances'][i]['free'],arg.acc_data['balances'][i]['locked']]
    	user_balance_table.row.add(insert_row).draw();
    }
})

$("#user-trade-query").bind("click",function(){
    ipcRenderer.send("get_user_trades_info",{symbol: symbolList.find(':selected').text()})
});

ipcRenderer.on("recieve_account_info",(event,arg)=>{
	$('#maker-cms').text(arg.acc_data['makerCommission'])
	$('#taker-cms').text(arg.acc_data['takerCommission'])
	$('#seller-cms').text(arg.acc_data['sellerCommission'])
	$('#can-trade').text(arg.acc_data['canTrade'])
	$('#can-withdraw').text(arg.acc_data['canWithdraw'])
	$('#can-deposit').text(arg.acc_data['canDeposit'])
	$('#updateTime').text(new Date(arg.acc_data['updateTime']))
 
    user_balance_table.clear().draw()
    for(let i in arg.acc_data['balances']){
    	let insert_row = [arg.acc_data['balances'][i]['asset'],arg.acc_data['balances'][i]['free'],arg.acc_data['balances'][i]['locked']]
    	user_balance_table.row.add(insert_row).draw();
    }
})

ipcRenderer.on("recieve_mytrades_info",(event,arg)=>{
	console.log(arg.trades)
	user_trades.clear().draw()
	for(let i in arg.trades){
		let insert_row = [arg.trades[i]['id'],arg.trades[i]['orderId'],arg.trades[i]['price'],arg.trades[i]['qty'],arg.trades[i]['commission'],arg.trades[i]['commsionAsset'],new Date(arg.trades[i]['time']),arg.trades[i]['isBuyer'],arg.trades[i]['isMaker'],arg.trades[i]['isBestMatch']]
		user_trades.row.add(insert_row).draw();
	}
})

async function initSymbolList(){
    symbolList.empty()
    symbolList.selectpicker({
        styleBase: 'btn',
        style: 'btn-default',
        dropupAuto: true,
        size: '10',
        width: '100px'
    });

    // Get binance exchangeInfo API data 
    let client = Binance()
    let exchangeInfo = await client.exchangeInfo();
    for ( let obj of exchangeInfo.symbols ) {
        symbolList.append($('<option>', { 
            text : obj['symbol'] 
        }));
    }

    symbolList.selectpicker('setStyle', 'btn-sm', 'add');
    symbolList.selectpicker('refresh');
    symbolList.selectpicker('render');
}