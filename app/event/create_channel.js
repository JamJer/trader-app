/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with create.html only
 * 
 * - Handle file change/load/delete/open request
 */
const $ = require("jquery");
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const path = require('path');
const url = require('url');
const YAML = require('yamljs')
const Binance = require('binance-api-node').default;

// fetch global variable
var policyList = $("#policy-list");
var nowFile = "";
const fs = require('fs');
var editType = ''
var yaml_obj
var policy_template_string = 'error'
var afterNew = false

// edit panel jquery instances
var ed_policy_name = $("#ed-policy-name")
var ed_symbol_list = $("#ed-symbol-list")
var ed_duration = $("#ed-duration")
var ed_capital = $("#ed-capital")
var ed_ma = $("#ed-ma")
var ed_ma_unit_list = $("#ed-ma-unit-list")
var ed_buy_descrip = $("#ed-buy-descrip")
var ed_buy_range = $("#ed-buy-range")
var ed_buy_volume = $("#ed-buy-volumn")
var ed_buy_spread = $("#ed-buy-spread")
var ed_buy_stoloss = $("#ed-buy-Stoloss")
var ed_buy_rally = $("#ed-buy-Rally")
var ed_sell_descrip = $("#ed-sell-descrip")
var ed_sell_magnification = $("#ed-sell-Magnification")
var ed_sell_range = $("#ed-sell-range")
var ed_sell_volume = $("#ed-sell-volumn")
var ed_sell_belowma = $("#ed-sell-Belowma")

// list data
const MAUnitArr = ['m','h','d','M'];

/**
 * Editor - 
 * 
 * With communication with backend
 * @func initPolicyList - fetch and list the policies 
 * @func refreshPolicyList - refresh the policy board
 * @func saveFiles
 * @func deleteFiles
 * 
 * Event handler
 * @func #file-save
 * @func #file-discard 
 * @func #file-input
 * 
 */

// Function goes here
function initPolicyList(){
    /**
     * need to send signal to backend, let backend do the file handling process
     */
    $("#full_mask").addClass("is-active")
    ipcRenderer.send("policy_list",{})
}

ipcRenderer.on("response_policy_list",(event,arg)=>{
    /**
     * @param arg.msg
     * @param arg.data
     */

    // bot select box initialization
    policyList.find('option').remove().end()
    policyList.selectpicker('destroy');
    policyList.selectpicker({
        styleBase: 'btn',
        style: 'btn-default',
        dropupAuto: true,
        size: '10',
        deselectAllText: 'Deselect All'
    });

    policyList.append($('<option disabled selected style="display: none;">', { 
        text : "Choose a policy to edit" 
    }))

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

    policyList.on('changed.bs.select', function (e) {
        setPolicyToSettingPanel(e.target.value)
    });
    if(afterNew){
        afterNew = false
        setPolicyToSettingPanel(nowFile)
    }
    $("#full_mask").removeClass("is-active")
})


function refreshPolicyList(){
    policyList.find('option').remove().end()
    initPolicyList();
}

function setPolicyToSettingPanel(policy_name){
    ipcRenderer.send("policy_data",{policy_file: policy_name})
}

ipcRenderer.on("response_policy_data",(event,arg)=>{
    yaml_obj = YAML.parse(arg.data)
    ed_policy_name.val(arg.filename)
    ed_symbol_list.selectpicker('val', yaml_obj.symbol);
    ed_duration.val(yaml_obj.duration)
    ed_capital.val(yaml_obj.capital)
    ed_ma.val(processText(yaml_obj.ma)[0][0])
    ed_ma_unit_list.selectpicker('val', processText(yaml_obj.ma)[0][1]);
    ed_buy_descrip.val(yaml_obj.buy.descrip)
    ed_buy_range.val(yaml_obj.buy.range)
    ed_buy_volume.val(yaml_obj.buy.volume)
    ed_buy_spread.val(yaml_obj.buy.spread)
    ed_buy_stoloss.val(yaml_obj.buy.stoloss)
    ed_buy_rally.val(yaml_obj.buy.rally)
    ed_sell_descrip.val(yaml_obj.sell.descrip)
    ed_sell_magnification.val(yaml_obj.sell.magnification)
    ed_sell_range.val(yaml_obj.sell.range)
    ed_sell_volume.val(yaml_obj.sell.volume)
    ed_sell_belowma.val(yaml_obj.sell.belowma)
    policyList.selectpicker('val', arg.filename);
    fileEditButtonControl(false,false,false)
    controlEditPanelOpen(false);
    editType = 'old';
    nowFile = arg.filename;
})

function saveFiles(file_name,file_data,editType){
    ipcRenderer.send('policy_save',{
            filename: file_name,
            filedata: file_data,
            editType: editType,
            nowfilename: nowFile
        })
}

ipcRenderer.on("response_policy_save",(event,arg)=>{
    /**
     * @param arg.msg
     * @param arg.data
     */
    if(arg.msg == "success"){
        afterNew = true
        nowFile = arg.policy_id
        editType = 'old'
        $("#full_mask").removeClass("is-active")
        alert("提示: 交易策略已儲存")
        refreshPolicyList()
    }else{
        alert("交易策略儲存失敗 錯誤訊息:"+arg.msg)
    }
})

function deleteFiles(file_name){
    if (confirm("確定要刪除在伺服器上的 "+file_name+" 交易策略檔案?")) {
        // sending request to backend
        $("#full_mask").addClass("is-active")
        ipcRenderer.send("policy_delete",{
            filename: file_name
        })
    }
}

ipcRenderer.on("response_policy_delete",(event,arg)=>{
    /**
     * @param arg.msg
     * @param arg.data error code
     */
    alert("檔案刪除成功")
    $("#full_mask").removeClass("is-active")
    refreshPolicyList();
    clearEditPanel();
    inited_symbol_list();
    inited_ma_unit_list();
    fileEditButtonControl(false,true,true);
    controlEditPanelOpen(true);
})

//Event goes here

//This event is called when the DOM is fully loaded
window.addEvent("domready",function(){
    initPolicyList();
    inited_symbol_list();
    inited_ma_unit_list();
    controlEditPanelOpen(true);
});

$( "#file-add" ).click(function() {
    $("#full_mask").addClass("is-active")
    ipcRenderer.send("get_policy_template",{})
});

ipcRenderer.on("receive_policy_template",(event,arg)=>{
    if(arg.msg == "success"){
        editType = 'new'
        clearEditPanel()
        refreshPolicyList()
        fileEditButtonControl(false,false,false)
        controlEditPanelOpen(false);
        policy_template_string = arg.data
        $("#full_mask").removeClass("is-active")
        alert("提示: 可開始填入新的策略內容")
    }else{
        editType = ''
        clearEditPanel()
        refreshPolicyList()
        fileEditButtonControl(false,true,true)
        controlEditPanelOpen(true);
        alert("[RRCEIVE POLICY TEMPLATE] 取得策略模板失敗")
        policy_template_string = "error"
    }
})

$( "#file-save" ).click(function() {
    if(checkEditPanelIsEmpty()){
        $("#full_mask").addClass("is-active")
        switch(editType){
            case 'new':
                checkPolicyNameIsDuplicate(ed_policy_name.val(),'new')                
                break;
            case 'old':
                checkPolicyNameIsDuplicate(ed_policy_name.val(),'old')
                break;
            default:
                alert("Edit Type ERROR");
                return;
        }
    }
});

function checkPolicyNameIsDuplicate(policy_name,editTypeVal){
    ipcRenderer.send("check_policy_name_duplicate",{policy_id: policy_name,editType: editTypeVal,nowfilename: nowFile})
}

ipcRenderer.on("receive_check_policy_name_duplicate",(event,arg)=>{
    if(arg.editType == 'new'){
        if(arg.data){
            $("#full_mask").removeClass("is-active")
            alert("策略名稱已存在、請選擇其他名稱")
        }else{
            if(policy_template_string != "error"){
                yaml_obj = YAML.parse(policy_template_string)
                setEditedDataToYAMLObj();
                nowFile = ed_policy_name.val()+".yaml"
                saveFiles(ed_policy_name.val()+".yaml",YAML.stringify(yaml_obj),arg.editType);
            }else{
                $("#full_mask").removeClass("is-active")
                alert("尚未取得策略模板，新增失敗")
            }
        }
    }else if(arg.editType == 'old'){
        if(arg.data){
            $("#full_mask").removeClass("is-active")
            alert("策略名稱已存在、請選擇其他名稱")
        }else{
            setEditedDataToYAMLObj();
            saveFiles(ed_policy_name.val()+".yaml",YAML.stringify(yaml_obj),arg.editType);
        }
    }else{
        alert("檢查檔案名稱重複失敗")
    }
})

$( "#file-discard" ).click(function() {
    if(editType == 'old'){
        deleteFiles(nowFile);
    }else if(editType == 'new'){
        var r = confirm("確定要清除目前新增且未儲存的交易策略?");
        if (r == true) {
            clearEditPanel();
            controlEditPanelOpen(true);
            fileEditButtonControl(false,true,true)
        } else {
            return
        }
    }else{
        alert("未選擇檔案進行刪除")
        controlEditPanelOpen(true);
    }
});

// Used function goese here
async function inited_symbol_list(){
    ed_symbol_list.find('option').remove().end()
    ed_symbol_list.selectpicker({
        size: '10'
    });

    // Get binance exchangeInfo API data 
    let client = Binance()
    let exchangeInfo = await client.exchangeInfo();
    for ( let obj of exchangeInfo.symbols ) {
        ed_symbol_list.append($('<option>', { 
            text : obj['symbol'] 
        }));
    }

    ed_symbol_list.selectpicker('setStyle', 'btn-sm', 'add');
    ed_symbol_list.selectpicker('refresh');
    ed_symbol_list.selectpicker('render');
}

function inited_ma_unit_list(){
    // bot select box initialization
    ed_ma_unit_list.find('option').remove().end()
    ed_ma_unit_list.selectpicker({
        size: '10'   
    });

    MAUnitArr.forEach(val=>{
        ed_ma_unit_list.append($('<option>', { 
            text : val 
        }));
    })

    ed_ma_unit_list.selectpicker('setStyle', 'btn-sm', 'add');
    ed_ma_unit_list.selectpicker('refresh');
    ed_ma_unit_list.selectpicker('render');
}

function checkEditPanelIsEmpty(){
    if(ed_policy_name.val() == ''){ alert("交易策略名稱不得為空"); return false}
    if(ed_duration.val() == ''){ alert("運行時間不得為空"); return false}
    if(ed_capital.val() == ''){ alert("本金不得為空"); return false}
    if(ed_ma.val() == ''){ alert("MA不得為空"); return false}
    if(ed_buy_range.val() == ''){ alert("買進Range不得為空"); return false}
    if(ed_buy_volume.val() == ''){ alert("買進Volume不得為空"); return false}
    if(ed_buy_spread.val() == ''){ alert("買進Spread不得為空"); return false}
    if(ed_buy_stoloss.val() == ''){ alert("買進Stoloss不得為空"); return false}
    if(ed_buy_rally.val() == ''){ alert("買進Rally不得為空"); return false}
    if(ed_sell_magnification.val() == ''){ alert("賣出Magnification不得為空"); return false}
    if(ed_sell_range.val() == ''){ alert("賣出Range不得為空"); return false}
    if(ed_sell_volume.val() == ''){ alert("賣出Volume不得為空"); return false}
    if(ed_sell_belowma.val() == ''){ alert("賣出Belowma不得為空"); return false}
    return true
}

function clearEditPanel(){
    inited_symbol_list();
    inited_ma_unit_list();
    ed_policy_name.val("") 
    ed_duration.val("")
    ed_capital.val("")
    ed_ma.val("")
    ed_buy_descrip.val("")
    ed_buy_range.val("")
    ed_buy_volume.val("")
    ed_buy_spread.val("")
    ed_buy_stoloss.val("")
    ed_buy_rally.val("")
    ed_sell_descrip.val("")
    ed_sell_magnification.val("")
    ed_sell_range.val("")
    ed_sell_volume.val("")
    ed_sell_belowma.val("")
}

function fileEditButtonControl(a,b,c){
    $("#file-add").attr('disabled', a);
    $("#file-save").attr('disabled', b);
    $("#file-discard").attr('disabled', c);
}

function setEditedDataToYAMLObj(){
    yaml_obj.symbol = ed_symbol_list.find(':selected').text()
    yaml_obj.duration = Number(ed_duration.val())
    yaml_obj.capital = Number(ed_capital.val())
    yaml_obj.ma = ed_ma.val() + ed_ma_unit_list.find(':selected').text()
    yaml_obj.buy.descrip = ed_buy_descrip.val()
    yaml_obj.buy.range = Number(ed_buy_range.val())
    yaml_obj.buy.volume = Number(ed_buy_volume.val())
    yaml_obj.buy.spread = Number(ed_buy_spread.val())
    yaml_obj.buy.stoloss = Number(ed_buy_stoloss.val())
    yaml_obj.buy.rally = Number(ed_buy_rally.val())
    yaml_obj.sell.descrip = ed_sell_descrip.val()
    yaml_obj.sell.magnification = Number(ed_sell_magnification.val())
    yaml_obj.sell.range = Number(ed_sell_range.val())
    yaml_obj.sell.volume = Number(ed_sell_volume.val())
    yaml_obj.sell.belowma = Number(ed_sell_belowma.val())
}

function controlEditPanelOpen(isOpen){
    ed_policy_name.attr('disabled', isOpen);
    ed_symbol_list.attr('disabled', isOpen);
    ed_symbol_list.selectpicker('refresh')
    ed_duration.attr('disabled', isOpen);
    ed_capital.attr('disabled', isOpen);
    ed_ma.attr('disabled', isOpen);
    ed_ma_unit_list.attr('disabled', isOpen);
    ed_ma_unit_list.selectpicker('refresh')
    ed_buy_descrip.attr('disabled', isOpen);
    ed_buy_range.attr('disabled', isOpen);
    ed_buy_volume.attr('disabled', isOpen);
    ed_buy_spread.attr('disabled', isOpen);
    ed_buy_stoloss.attr('disabled', isOpen);
    ed_buy_rally.attr('disabled', isOpen);
    ed_sell_descrip.attr('disabled', isOpen);
    ed_sell_magnification.attr('disabled', isOpen);
    ed_sell_range.attr('disabled', isOpen);
    ed_sell_volume.attr('disabled', isOpen);
    ed_sell_belowma.attr('disabled', isOpen);
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