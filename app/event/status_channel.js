/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with status.html only
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const storage = require('electron-json-storage');
const Binance = require('binance-api-node').default;
const path = require('path');
const url = require('url');
const $  = require( 'jquery' );
const dt = require( 'datatables.net' )();
var policyList = $("#policy-list");
var symbolList = $("#symbol-list")
const utils = require('../utils/ui')
const DATA_REFLESH_TIME = 30000;
// DataTable variable
var botStatusTable
var botsTradeBuyRecordsTable
var botsTradeSellRecordsTable

// DataTable initialization
botStatusTable = $('#bot_status_table').DataTable( {
    "createdRow": function ( row, data, index ) {
                $('td', row).eq(0).addClass('botid');
                $('td', row).eq(1).addClass('strategy');
                $('td', row).eq(2).addClass('symbol');
                $('td', row).eq(3).addClass('working');
                if ( data[4] > 0 ) {
                    $('td', row).eq(4).addClass('gain');
                }else if( data[4] < 0 ) {
                    $('td', row).eq(4).addClass('loss');
                }else{
                    $('td', row).eq(4).addClass('nothing');
                }
            },
        "autoWidth": true,
        "paging": true,
        columnDefs: [{ 
            "orderable": false, 
            "targets": 6 
        },{ "width": "13%", 
            "targets": 0 
        },
        { "width": "13%", 
            "targets": 1 
        },
        { "width": "8%", 
            "targets": 2 
        },
        { "width": "15%", 
            "targets": 3 
        },
        { "width": "10%", 
            "targets": 4 
        },
        { "width": "10%", 
            "targets": 5 
        }
        ],
        fixedColumns: false,
        autoFill: false,
        data: [],
        columns: [
            { title: "機器人ID" },
            { title: "交易策略" },
            { title: "市場"},
            { title: "動作"},
            { title: "利潤" },
            { title: "收益率" },
            { title: "管理機器人" }
        ]
} );

botSelectedTeble = $('#bot_symbol_selected_table').DataTable( {
    "createdRow": function ( row, data, index ) {
                $('td', row).eq(0).addClass('symbol');
                $('td', row).eq(1).addClass('strategy');
            },
        "autoWidth": true,
        "paging": true,
        "pageLength": 5,
        "lengthMenu": [[5, 10, 20, -1], [5, 10, 20, "Todos"]],
        fixedColumns: true,
        autoFill: true,
        data: [],
        columns: [
            { title: "市場" },
            { title: "交易策略" },
            { title: "管理" }
        ]
} );
botsTradeBuyRecordsTable = $('#bots_buy_records_table').DataTable( {
    "createdRow": function ( row, data, index ) {
                $('td', row).eq(0).addClass('botid');
                $('td', row).eq(1).addClass('default');
                $('td', row).eq(2).addClass('strategy');
                $('td', row).eq(3).addClass('symbol');
                $('td', row).eq(4).addClass('default');
                $('td', row).eq(5).addClass('default');
                $('td', row).eq(6).addClass('default');
            },
        "autoWidth": true,
        "paging": true,
        columnDefs: [{ 
            "orderable": false, 
            "targets": 2 
        }],
        fixedColumns: true,
        autoFill: true,
        data: [],
        columns: [
            { title: "機器人編號" },
            { title: "時間日期" },
            { title: "交易策略" },
            { title: "市場" },
            { title: "買入數量" },
            { title: "買入價格" },
            { title: "買入" }
        ]
} );

botsTradeSellRecordsTable = $('#bots_sell_records_table').DataTable( {
    "createdRow": function ( row, data, index ) {
                $('td', row).eq(0).addClass('botid');
                $('td', row).eq(1).addClass('default');
                $('td', row).eq(2).addClass('strategy');
                $('td', row).eq(3).addClass('symbol');
                $('td', row).eq(4).addClass('default');
                $('td', row).eq(5).addClass('default');
                $('td', row).eq(6).addClass('default');
                $('td', row).eq(7).addClass('default');
                $('td', row).eq(8).addClass('default');
            },
        "autoWidth": true,
        "paging": true,
        columnDefs: [{ 
            "orderable": false, 
            "targets": 2 
        }],
        fixedColumns: true,
        autoFill: true,
        data: [],
        columns: [
            { title: "機器人編號" },
            { title: "時間日期" },
            { title: "交易策略" },
            { title: "市場" },
            { title: "賣出數量" },
            { title: "賣出價格" },
            { title: "賣出" },
            { title: "利潤" },
            { title: "收益率" }
        ]
} );

$( document ).ready(function() {
    // Select initialization
    initPolicyList();
    initSymbolList();
    initTradeRecords();
    
    ipcRenderer.send('update_bot_status',{})

    setInterval(function(){
        // send message to update table
        ipcRenderer.send('update_bot_status',{})
        initTradeRecords();
    },DATA_REFLESH_TIME)
});

/**
 * Create bot instance event
 */
let bot = document.querySelector('#bot')
bot.addEventListener("submit",function(event){
    event.preventDefault();
    let startBtn = '<button type="button" class="btn btn-info btn-sm dt-sleBotStart">啟動</button>'
    let deleteBtn = '<button type="button" class="btn btn-danger btn-sm dt-sleBotDelete"><i class="fas fa-trash-alt" style="font-size: 20px;"></i></button>'
    let actionBtn = startBtn+"&nbsp;"+deleteBtn
    let dt_insert = [
        symbolList.find(':selected').text(),
        policyList.find(':selected').text(),
        actionBtn
    ]
    botSelectedTeble.row.add(dt_insert).draw();

    //Delete buttons event
    botSelectedTeble.off('click', '.dt-sleBotDelete')
    botSelectedTeble.on('click', '.dt-sleBotDelete', function(){
        var data = botSelectedTeble.row( $(this).parents('tr') ).data();
        botSelectedTeble.row( $(this).parents('tr') ).remove().draw();
        handeStartAllButton();
    });

    //Start bot button event
    botSelectedTeble.off('click', '.dt-sleBotStart')
    botSelectedTeble.on('click', '.dt-sleBotStart', function(){
        var data = botSelectedTeble.row( $(this).parents('tr') ).data();
        ipcRenderer.send('create_bot',{
            //  * TODO: create bot with specified:
            //  * @param policy_file
            //  * @param symbol
            policy_file: policyList.find(':selected').text(),
            symbol: symbolList.find(':selected').text()
        })
        botSelectedTeble.row( $(this).parents('tr') ).remove().draw();
        handeStartAllButton();
    });
    handeStartAllButton();
})

// Active all button handle event goes here
$("#bot-selected-activeAll").bind("click",function(){
    botSelectedTeble.rows().every( function () {
        var d = this.data();
        ipcRenderer.send('create_bot',{
            //  * TODO: create bot with specified:
            //  * @param policy_file
            //  * @param symbol
            policy_file: d[1],
            symbol: d[0]
        })
    } );
    botSelectedTeble.clear().draw();
    handeStartAllButton();
});

// Clear all local histroy button handle event goes here
$("#bot-trade-history-delete").bind("click",function(){
    storage.clear(function(error) {
      if (error) throw error;
      botsTradeBuyRecordsTable.clear().draw()
      botsTradeSellRecordsTable.clear().draw()
    });
});

/**
 * ipc render channel go here
 * 
 * @func receive_bot_status
 */
ipcRenderer.on('receive_bot_status',(event,arg)=>{
    console.log(arg)
    /**
     * using the arg to update the table - bot_status
     * 
     * @param arg.id_queue
     */

    // Clean Bot Table before every update
    botStatusTable.clear().draw()
    for(let i in arg.id_queue){
        //Delete buttons
        let d_btn = '<button type="button" class="btn btn-danger btn-sm dt-delete"><i class="fas fa-minus-circle" style="font-size: 20px;"></i> 刪除</button>'
        let e_btn = '<button type="button" class="btn btn-primary btn-sm dt-edit"><i class="fas fa-sliders-h" style="font-size: 20px;"></i> 運作狀況</button>'
        let s_btn = ''
        if(arg.id_queue[i].buyInfoLength > 0){
            s_btn = '<button type="button" class="btn btn-warning btn-sm dt-sell"><i class="fas fa-hand-holding-usd"></i> 立即賣出</button>'
        }else{
            $("#full_mask").removeClass("is-active")
            s_btn = '<button type="button" class="btn btn-warning btn-sm dt-sell" disabled="true"><i class="fas fa-hand-holding-usd"></i> 立即賣出</button>'
        }
        let mn_btn = s_btn+"&nbsp;"+e_btn+"&nbsp;"+d_btn
        let profit_res = arg.id_queue[i].trade_data.trade_log
        let profit = 0
        let profit_rate = 0
        for (let j = 0; j < profit_res.length; j++) {
            profit += profit_res[j].profit
            profit_rate += profit_res[j].profit_rate
        }

        let profit_percentage = profit_rate*100.0
        let dt_arr = [
            arg.id_queue[i].id,
            arg.id_queue[i].detail,
            arg.id_queue[i].symbol,
            arg.id_queue[i].tradeStatus,
            profit.toFixed(6),
            profitP(profit_percentage.toFixed(2)),
            mn_btn
        ]
        // append into target
        // document.getElementById("bot_status_table").appendChild(tr)
        botStatusTable.row.add(dt_arr).draw();
    }
    botStatusTable.off('click','.dt-delete')
    botStatusTable.on('click', '.dt-delete', function(){
        var data = botStatusTable.row( $(this).parents('tr') ).data();
        if(confirm("Are you sure to delete this bot?")){
            botStatusTable.row( $(this).parents('tr') ).remove().draw();
            console.log("Killing ... id=",data[0])
            // send the killing signal to event.js
            ipcRenderer.send('kill_bot',{
                id: data[0]
            })
        }
    });
    botStatusTable.off('click','.dt-edit')
    botStatusTable.on('click', '.dt-edit', function(){
        var data = botStatusTable.row( $(this).parents('tr') ).data();
        // will enter bot instance status
        console.log("Touched")
        ipcRenderer.send('edit_bot',{
            id: data[0]
        })
    });
    botStatusTable.off('click','.dt-sell')
    botStatusTable.on('click', '.dt-sell', function(){
        var data = botStatusTable.row( $(this).parents('tr') ).data();
        // will enter bot instance status
        console.log("SELL TOUCHED")
        $("#full_mask").addClass("is-active")
        ipcRenderer.send('sellAll_bot',{
            id: data[0]
        })
    });
})


ipcRenderer.on("bot_instance_start",(event,arg)=>{
    // enter bot instance page
    window.location.href="bot_instance.html";
})

function initPolicyList(){
    /**
     * need to send signal to backend, let backend do the file handling process
     */
    policyList.empty()
    ipcRenderer.send("policy_list",{})
}

function initTradeRecords(){
    botsTradeBuyRecordsTable.clear().draw()
    botsTradeSellRecordsTable.clear().draw()

    storage.keys(function(error, keys) {
      if (error) throw error;
      for (let k in keys) {
        storage.get(keys[k], function(error, data) {
            if (error) throw error;
            // console.log("Bot "+arg['id']+"local trade record: "+data)
            for(let i in data){
                if(data[i].type == "buy"){
                    let insert_row = [keys[k],data[i].timeStamp,data[i].tradePolicy,data[i].symbol,data[i].quantity.toFixed(6),data[i].price.toFixed(6),data[i].buy.toFixed(6)];
                    botsTradeBuyRecordsTable.row.add(insert_row).draw();
                }
                else if(data[i].type == "sell"){
                    let insert_row = [keys[k],data[i].timeStamp,data[i].tradePolicy,data[i].symbol,data[i].quantity.toFixed(6),data[i].price.toFixed(6),data[i].sell.toFixed(6),data[i].profit.toFixed(6),data[i].ror.toFixed(6)];
                    botsTradeSellRecordsTable.row.add(insert_row).draw();
                }
            }
        });
      }
    });
}

ipcRenderer.on("response_policy_list",(event,arg)=>{
    /**
     * @param arg.msg
     * @param arg.data
     */

    policyList.selectpicker({
        styleBase: 'btn',
        style: 'btn-default',
        dropupAuto: true,
        size: 'fit'
    });

    if(arg.data.length != undefined){
        arg.data.forEach(file=>{
            policyList.append($('<option>', { 
                text : file 
            }));
        })
    }

    policyList.selectpicker('setStyle', 'btn-sm', 'add');
    policyList.selectpicker('refresh');
    policyList.selectpicker('render');
})

function handeStartAllButton(){
    if(!botSelectedTeble.data().count()){
        $('#bot-selected-activeAll').attr('disabled', true);
    }else{
        $('#bot-selected-activeAll').attr('disabled', false);
    }
}

async function initSymbolList(){
    symbolList.empty()
    symbolList.selectpicker({
        styleBase: 'btn',
        style: 'btn-default',
        dropupAuto: true,
        size: '10'
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

function profitP(profit_rate){
    if(profit_rate > 0){
        return '<span class="badge badge-success">'+profit_rate+'%</span>';
    }else if(profit_rate < 0){
        return '<span class="badge badge-danger">'+profit_rate+'%</span>';
    }else{
        return '<span class="badge badge-primary">0.00%</span>';
    }
}