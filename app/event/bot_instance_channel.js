/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with bot_instance.html only
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const os = require('os');
const fs = require('fs');
const path = require('path');
const url = require('url');
const storage = require('electron-json-storage');
const Binance = require('binance-api-node').default;
const file_ext = ".ect";
// EChart initialization
var echarts = require('echarts');
// EChart dark theme
const dark = require('../lib/js/dark')
// Global var
var logger = null;
const $ = require('jquery');
const dt = require( 'datatables.net' )();
var bot_ma_unit_type = ['m','h','d','M'];
var bot_symbol_select = $('#bot-cointype-select');
var bot_ma_unit_select = $('#bot-ma-unit-select');
var bot_status_view = $('#bot-status-view');
const data_reflesh_interval = 30000;

// DataTable variable
var botTradeBuyTable
var botTradeSellTable

// DataTable initialization
botTradeBuyTable = $('#bot_trade_buy_table').DataTable( {
    "createdRow": function ( row, data, index ) {
                $('td', row).eq(0).addClass('normal');
                $('td', row).eq(1).addClass('market');
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
            { title: "時間日期" },
            { title: "交易策略" },
            { title: "市場" },
            { title: "買入數量" },
            { title: "買入價格" },
            { title: "買入" }
        ]
} );

// DataTable initialization
botTradeSellTable = $('#bot_trade_sell_table').DataTable( {
    "createdRow": function ( row, data, index ) {
                $('td', row).eq(0).addClass('normal');
                $('td', row).eq(1).addClass('market');
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
            { title: "時間日期" },
            { title: "交易策略" },
            { title: "市場" },
            { title: "賣出數量" },
            { title: "賣出價格" },
            { title: "賣出" },
            { title: "收益率" },
            { title: "賣出類型" }
        ]
} );

// send signal to fetch current bot status
ipcRenderer.send("get_bot",{});

setInterval(function(){
    $("#bot-reflesh-btn").unbind( "click" );
    $("#bot-save-btn").unbind("click");
    ipcRenderer.send("get_bot",{});  
},data_reflesh_interval)

// receive current bot status
ipcRenderer.on("receive_bot",(event,arg)=>{
    /**
     * @param id
     * @param ma
     * @param symbol
     */
    // TODO:
    // Using these 3 element to render the bot_instance.html
    // Also set the edit panel, let user can edit the parameter of these parameter

    // --------------BOT PROFIT CHART PANEL GOES HERE----------------

    // EChart initialization
    let chart_dom = document.querySelector('#profit_chart')
    let eChart = echarts.init(chart_dom,'dark');
    let option = null;
    let profit_res = arg["trade_data"].trade_log;
    let profit_data = [];
    let xAxisArr = [];
    // Generate profit rate data
    for (var i = 0; i < profit_res.length; i++) {
        profit_data.push(profit_res[i].profit.toFixed(6));
    }
    // Generate date x-Axis data
    for (var i = 0; i < profit_res.length; i++) {
        xAxisArr.push(profit_res[i].trade_date);
    }
    // Setting option variable for eChart
    option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data:['Profit'],
            show: false
        },
        toolbox: {
            orient: 'vertical',
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
        visualMap: {
            pieces: [{
                gt: 0,
                lte: 99,
                color: '#00cc66'
            },{
                gt: -99,
                lte: 0,
                color: '#ff5050'
            }],
            outOfRange: {
                color: '#999'
            },
            textStyle: {
            color: '#fff'
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
                data: profit_data,
                markPoint: {
                    data: [
                        {type: 'max', name: '最大值', itemStyle: { color: '#00994d'}},
                        {type: 'min', name: '最小值'}
                    ]
                },
                markLine: {
                    silent: true,
                    data: [
                        {type: 'average', name: '平均值'}
                    ]
                }
            }
        ]
    };
    // reload the eChart
    eChart.setOption(option, true);
    // --------------BOT PROFIT CHART PANEL END HERE----------------

    // --------------BOT SETTING PANEL GOES HERE----------------
    // Show bot id
    $('#bot-id').text(arg['id'])
    $("#bot-ma-val").val(processText(arg['ma'])[0][0])

    // Clean select's all options for rerendering 
    removeAllSelectItem(bot_symbol_select)
    removeAllSelectItem(bot_ma_unit_select)

    initSymbolList(arg['symbol']);

    $.each(bot_ma_unit_type, function( index, value ) {
      bot_ma_unit_select.append($('<option>', { 
            text : value 
        }));
    });

    // Initialize ma unit select
    bot_ma_unit_select.selectpicker({
        styleBase: 'btn',
        style: 'btn-secondary',
        dropupAuto: true,
        size: 'fit'
    });

    bot_ma_unit_select.selectpicker('setStyle', 'btn-sm', 'add');
    bot_ma_unit_select.selectpicker('val', processText(arg['ma'])[0][1]);
    bot_ma_unit_select.selectpicker('refresh');
    bot_ma_unit_select.selectpicker('render');

    // bot select box events
    bot_symbol_select.on('changed.bs.select', function (e) {
        if(valCompare(e.target.value,arg['symbol'])){
            $('#bot-save-btn').attr('disabled', true);
        }else{
            $('#bot-save-btn').attr('disabled', false);
        }
    });

    bot_ma_unit_select.on('changed.bs.select', function (e) {
        if(valCompare(e.target.value,processText(arg['ma'])[0][1])){
            $('#bot-save-btn').attr('disabled', true);
        }else{
            $('#bot-save-btn').attr('disabled', false);
        }
    });

    // Handle ma value be digit only
    $("#bot-ma-val").keypress(function(event) {
        return isNumberKey(event);
    });

    // Save button isable handle
    $("#bot-ma-val").bind("change paste keyup", function() {
        if(valCompare($(this).val(),processText(arg['ma'])[0][0])){
            $('#bot-save-btn').attr('disabled', true);
        }else{
            $('#bot-save-btn').attr('disabled', false);
        }
    });

    // Reflesh button handle
    $("#bot-reflesh-btn").bind("click",function(){
        ipcRenderer.send("get_bot",{})
        $("#bot-reflesh-btn").unbind( "click" ) // unbind listener to avoid recursive binding
    });

    // Save button send out changed data
    $("#bot-save-btn").bind("click",function(){
        console.log("Update bot: id:"+arg['id']+" ma: "+$("#bot-ma-val").val()+bot_ma_unit_select.val()+" symbol: "+bot_symbol_select.val())
        send_changes(arg['id'],$("#bot-ma-val").val()+bot_ma_unit_select.val(),bot_symbol_select.val())
        alert("Successfully changed bot parameter.")
        $("#bot-save-btn").unbind("click") // unbind listener to avoid recursive binding
    });

    $("#bot-back-btn").bind("click",function(){
        window.location = 'status.html'
    });
    // --------------BOT SETTING PANEL GOES END---------------------

    // --------------BOT STATUS VIEW PANEL GOES HERE----------------
    // FIXME: 
    // Get the streaming log from bot instance
    // Warning, current tick need to sync with the update rate in bot_instnace.js
    let isreadable = true
    setInterval(function(){
        logger = fs.createReadStream(path.join(os.tmpdir(),arg['id']+"_debug"+file_ext),'UTF8')
        logger.on('readable',function(){
            if(isreadable){
                bot_status_view.val('');
                bot_status_view.val(logger.read());
                isreadable = false
                if(bot_status_view.length){
                    bot_status_view.scrollTop(bot_status_view[0].scrollHeight - bot_status_view.height());
                }
            }else{
                isreadable = true
            }
        })
        logger.on('error',function(err){
            console.log(`[Bot][Error] streaming error. error code: ${err}`)
        })
    },10000)
    // --------------BOT STATUS VIEW PANEL GOES END-----------------

    // --------------BOT TRADE HISTORY GOES HERE----------------
    botTradeBuyTable.clear().draw()
    botTradeSellTable.clear().draw()

    storage.get(arg['id'], function(error, data) {
        if (error) throw error;
        // console.log("Bot "+arg['id']+"local trade record: "+data)
        for(let i in data){
            if(data[i].type == "buy"){
                let insert_row = [data[i].timeStamp,data[i].tradePolicy,data[i].symbol,data[i].quantity.toFixed(6),data[i].price.toFixed(6),data[i].buy.toFixed(6)];
                botTradeBuyTable.row.add(insert_row).draw();
            }
            else if(data[i].type == "sell"){
                let insert_row = [data[i].timeStamp,data[i].tradePolicy,data[i].symbol,data[i].quantity.toFixed(6),data[i].price.toFixed(6),data[i].sell.toFixed(6),data[i].ror.toFixed(6),data[i].status];
                botTradeSellTable.row.add(insert_row).draw();
            }
        }
    });

    // Delete bot history button handle
    $("#bot-trade-history-delete").bind("click",function(){
        storage.set(arg['id'], [], function(error) {
            if (error) throw error;
            $("#bot-trade-history-delete").unbind( "click" ) // unbind listener to avoid recursive binding
            ipcRenderer.send("get_bot",{});
        });
    });
    // --------------BOT TRADE HISTORY GOES END----------------
})

/**
 * function send the edited options to backend, let the bot change its behavior
 * 
 * @function send_changes
 */
function send_changes(id,new_ma,new_symbol){
    /**
     * @param id (optional) 可不放
     * @param ma
     * @param symbol
     */
    ipcRenderer.send("set_bot",{
        id: id,
        ma: new_ma,
        symbol: new_symbol
    })

    // Update page after sending changes
    ipcRenderer.send("get_bot",{});
    $("#bot-reflesh-btn").unbind( "click" );
    $('#bot-save-btn').attr('disabled', true);
}

/**
 * function compare two string if the same
 * 
 * @function valCompare
 */
function valCompare(val1,val2){
    /**
     * @param val1
     * @param val2
     */
    if(val1.localeCompare(val2) == 0){
        return true;
    }else{
        return false;
    }
}

/**
 * function to split a string into digit and english
 * 
 * @function processText
 */
function processText(inputText) {
    /**
     * @param inputText
     */
    var output = [];
    var json = inputText.split(' ');
    json.forEach(function (item) {
        output.push(item.replace(/\'/g, '').split(/(\d+)/).filter(Boolean));
    });
    return output;
}

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
    if (charCode != 46 && charCode > 31 
    && (charCode < 48 || charCode > 57))
    return false;
    return true;
}

/**
 * function remove a select all option
 * 
 * @function removeAllSelectItem
 */
function removeAllSelectItem(jqobj){
    /**
     * @param jqobj (jquery instance)
     */
    jqobj.find('option').remove().end();
}

async function initSymbolList(now_symbol){
    bot_symbol_select.empty()
    bot_symbol_select.selectpicker({
        styleBase: 'btn',
        style: 'btn-default',
        dropupAuto: true,
        size: '10'
    });

    // Get binance exchangeInfo API data 
    let client = Binance()
    let exchangeInfo = await client.exchangeInfo();
    for ( let obj of exchangeInfo.symbols ) {
        bot_symbol_select.append($('<option>', { 
            text : obj['symbol'] 
        }));
    }

    bot_symbol_select.selectpicker('setStyle', 'btn-sm', 'add');
    bot_symbol_select.selectpicker('val', now_symbol);
    bot_symbol_select.selectpicker('refresh');
    bot_symbol_select.selectpicker('render');
}