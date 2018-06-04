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
const file_ext = ".ect";
// Global var
var logger = null;
const $ = require('jquery');
const bot_coin_type = ['BTCUSDT','ETHUSDT'];
var bot_ma_unit_type = ['d','t'];
var bot_symbol_select = $('#bot-cointype-select');
var bot_ma_unit_select = $('#bot-ma-unit-select');
var bot_status_view = $('#bot-status-view');

// send signal to fetch current bot status
ipcRenderer.send("get_bot",{});

// receive current bot status
ipcRenderer.on("receive_bot",(event,arg)=>{
    /**
     * @param id
     * @param ma
     * @param symbol
     */
    console.log(arg)
    // TODO:
    // Using these 3 element to render the bot_instance.html
    // Also set the edit panel, let user can edit the parameter of these parameter

    // TODO: (Long-term goal)
    // 獲利曲線 UI（該 bot 的獲利曲線，呈獻其運行到目前的收益情況）
    // 詳細可以參考後端程式碼： src/model/trade_bot.js 的實作

    // FIXME: 
    // Get the streaming log from bot instance
    // Warning, current tick need to sync with the update rate in bot_instnace.js
    let isreadable = true
    setInterval(function(){
        logger = fs.createReadStream(path.join(os.tmpdir(),arg.id+file_ext),'UTF8')
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

    // --------------BOT SETTING PANEL GOES HERE----------------
    // Show bot id
    $('#bot-id').text(arg['id'])
    $("#bot-ma-val").val(processText(arg['ma'])[0][0])

    // Clean select's all options for rerendering 
    removeAllSelectItem(bot_symbol_select)
    removeAllSelectItem(bot_ma_unit_select)

    // Insert data into select element
    $.each(bot_coin_type, function( index, value ) {
      bot_symbol_select.append($('<option>', { 
            text : value 
        }));
    });

     $.each(bot_ma_unit_type, function( index, value ) {
      bot_ma_unit_select.append($('<option>', { 
            text : value 
        }));
    });

    // bot select box initialization
    bot_symbol_select.selectpicker({
        styleBase: 'btn',
        style: 'btn-secondary',
        dropupAuto: true,
        size: 'fit'
    });

    bot_ma_unit_select.selectpicker({
        styleBase: 'btn',
        style: 'btn-secondary',
        dropupAuto: true,
        size: 'fit'
    });

    bot_symbol_select.selectpicker('setStyle', 'btn-sm', 'add');
    bot_symbol_select.selectpicker('val', arg['symbol']);
    bot_ma_unit_select.selectpicker('setStyle', 'btn-sm', 'add');
    bot_ma_unit_select.selectpicker('val', processText(arg['ma'])[0][1]);

    // reflesh and rerender ui
    bot_symbol_select.selectpicker('refresh');
    bot_symbol_select.selectpicker('render');
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
    
    // --------------BOT STATUS VIEW PANEL GOES END-----------------
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