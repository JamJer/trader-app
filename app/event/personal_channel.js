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
const storage = require('electron-json-storage');

var user_balance_table
var user_trades
var symbolList = $('#symbol-list')
var nowFundSegVal 

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

// Event goes here
$( document ).ready(function() {
	initSymbolList()
    getBuyTimesAndBuyLot()
    ipcRenderer.send("get_user_account_info",{})
    ipcRenderer.send("get_user_key_info",{})
    ipcRenderer.send("get_user_fund_seg_val",{})

    setInterval(function(){
        getBuyTimesAndBuyLot()
    },10000)
});

// Handle fund-segment value be digit only
$("#fund-segment").keypress(function(event) {
    return isNumberKey(event);
});

$("#fund-segment").keyup(function(event) {
    console.log($("#fund-segment").val()+" "+nowFundSegVal)
    if($("#fund-segment").val() == nowFundSegVal){
        $("#fund-segment-save").attr('disabled', true);
    }else{
        $("#fund-segment-save").attr('disabled', false);
    }
})
$("#fund-segment-save").bind("click",function(){
    let seg_val = Number($("#fund-segment").val())
    if(isInt(seg_val) || isFloat(seg_val)){
        if(seg_val == 0){
            if($("#fund-segment").val() != '0'){
                alert("買入等份額度小數點數值格式錯誤")
            }else{
                alert("買入等份額度不得小於1份")
            }
        }else{
            var r = confirm("確定要重新設定買入等份額度? 重設將刪除所有運行中的機器人");
            if (r == true) {
                ipcRenderer.send("save_user_fund_seg_val",{val: seg_val})
                ipcRenderer.send("kill_all_bot_for_reset",{val: seg_val})
            }
        }
    }else{
        if(seg_val == ''){
            alert("買入等份額度不得為空")
        }else{
            alert("買入等份額度須為整數或小數")
        }
    }
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

ipcRenderer.on("recieve_account_key_info",(event,arg)=>{
    $("#max-buy-vol").text(Number(arg.key_info.limit_fund.split(" ")[0]).toFixed(6))
    $("#key-exp-time").text(new Date(arg.key_info.end_time))
})

$("#user-trade-query").bind("click",function(){
    ipcRenderer.send("get_user_trades_info",{symbol: symbolList.find(':selected').text()})
});

ipcRenderer.on("recieve_mytrades_info",(event,arg)=>{
	console.log(arg.trades)
	user_trades.clear().draw()
	for(let i in arg.trades){
		let insert_row = [arg.trades[i]['id'],arg.trades[i]['orderId'],arg.trades[i]['price'],arg.trades[i]['qty'],arg.trades[i]['commission'],arg.trades[i]['commsionAsset'],new Date(arg.trades[i]['time']),arg.trades[i]['isBuyer'],arg.trades[i]['isMaker'],arg.trades[i]['isBestMatch']]
		user_trades.row.add(insert_row).draw();
	}
})

ipcRenderer.on("recieve_user_fund_seg_val",(event,arg)=>{
    nowFundSegVal = arg.seg_val
    $("#fund-segment").val(arg.seg_val)
    $("#fund-segment-save").attr('disabled', true);
    $("#current-bot-buy").text(($("#max-buy-vol").text()/arg.seg_val).toFixed(6))
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

function getBuyTimesAndBuyLot(){
    ipcRenderer.send('get_trade_limit_info',{})
}

ipcRenderer.on("receive_trade_limit_info",(event,arg)=>{
   if(isNaN(arg.now_buy_times)){
    $("#current-buy-vol").text("Loading...")
   }else{
    $("#current-buy-vol").text((((arg.limit_fund.split(" ")[0]+".00") / arg.seg_val) * (arg.seg_val - arg.now_buy_times)).toFixed(6))
   } 
   $("#current-buy-bar").text(((((arg.limit_fund.split(" ")[0]+".00") / arg.seg_val) * (arg.seg_val - arg.now_buy_times))/arg.limit_fund.split(" ")[0])*100+"%")
   $("#current-buy-bar").css("width", ((((arg.limit_fund.split(" ")[0]+".00") / arg.seg_val) * (arg.seg_val - arg.now_buy_times))/arg.limit_fund.split(" ")[0])*100+"%");
})


/**
 * function to check your input is number
 * 
 * @function isNumberKey
 */
function isNumberKey(evt)
{
    /**
     * @param evt (presskey event)
     */
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    console.log(charCode)
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
}

function isInt(n){
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}