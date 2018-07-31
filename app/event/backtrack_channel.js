/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with backtrack.html only
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
require( 'tempusdominus-bootstrap-4' );
// fetch global variable
var policyList = $("#policy-list");
var policy_view = $("#policy-view");

$.fn.datetimepicker.Constructor.Default = $.extend({}, $.fn.datetimepicker.Constructor.Default, {
	icons: {
		time: 'far fa-clock',
        date: 'far fa-calendar',
        up: 'fa fa-arrow-up',
        down: 'fa fa-arrow-down'
    }
});

$(function () {
	$('#bt_start_time').datetimepicker({
		format: "Y-MM-DD HH:mm:ss"
	});
	$('#bt_end_time').datetimepicker({
		format: "Y-MM-DD HH:mm:ss",
		useCurrent: false
	});
	$("#bt_start_time").on("change.datetimepicker", function (e) {
		$('#bt_end_time').datetimepicker('minDate', e.date);
        handleSubmitBtn()
    });
    $("#bt_end_time").on("change.datetimepicker", function (e) {
        $('#bt_start_time').datetimepicker('maxDate', e.date);
        handleSubmitBtn()
    });
});

function refleshPolicyList(){
    $('ul').empty();
    initPolicyList();
}

$( document ).ready(function() {
    initPolicyList()
});

policyList.on('change', function () {
    const selected = $(this).find(':selected').text();
    setPolicyToView(selected);
})

$("#bot-backtrack-btn").bind("click",function(){
    goBackTrack(policy_view.val(),$("#bt_start_time").val(),$("#bt_end_time").val())
});

function setPolicyToView(policy_name){
    ipcRenderer.send("policy_data",{policy_file: policy_name})
}

ipcRenderer.on("response_policy_data",(event,arg)=>{
    policy_view.val('');
    console.log("AAA")
    policy_view.val(arg["data"]);
    handleSubmitBtn()
})

function goBackTrack(yaml_string, start_time, end_time){
    loadingBt(true);
    ipcRenderer.send("backtrack_bot",{
        yaml_string: yaml_string,
        start_time: start_time,
        end_time: end_time
    })  
}

ipcRenderer.on("receive_backtrack_bot",(event,arg)=>{
    /**
     * @param arg.res
     */
    let res = arg.res;
    console.log(res)
    $("#bt_rs_balance").text(res.balance)
    $("#bt_rs_capital").text(res.capital)
    $("#bt_rs_curMA").text(res.currentMA+"("+res.currentMATime+")")
    $("#bt_rs_curPrice").text(res.currentPrice+"("+res.currentPriceTime+")")
    $("#bt_rs_curStatus").text(res.currentVolumeMul)
    $("#bt_rs_volMUL").text(res.balance)
    $("#bt_rs_start").text(res.startTime)
    $("#bt_rs_end").text(res.endTime)
    $("#bt_rs_ttBuy").text(res.totalBuy)
    $("#bt_rs_ttSell").text(res.totalSell)
    $("#bt_rs_ttRor").text(res.totalRor)
    loadingBt(false);
})

function initPolicyList(){
    /**
     * need to send signal to backend, let backend do the file handling process
     */
    ipcRenderer.send("policy_list",{})
}

ipcRenderer.on("response_policy_list",(event,arg)=>{
    /**
     * @param arg.msg
     * @param arg.data
     */
    policyList.append($('<option disabled selected style="display: none;">', { 
        text : "Choose a policy to backtrack" 
    }))
    if(arg.data.length != undefined){
        arg.data.forEach(file=>{
            policyList.append($('<option>', { 
                text : file 
            }));
        })
    }
})

function handleSubmitBtn(){
    if(( policy_view.val() != '') && ( $("#bt_start_time").val() != '' ) && ( $("#bt_end_time").val() != '')){
        $("#bot-backtrack-btn").attr('disabled', false);
    }else{
        $("#bot-backtrack-btn").attr('disabled', true);
    }
}

function loadingBt(isloading){
    if(isloading){
        $.busyLoadFull("show", {
            text: "Backtracking ...",
            fontawesome: "fa fa-cog fa-w-16 fa-spin fa-lg fa-5x",
            fontSize: "3rem",
            animation: "fade"
        });
    }else{
        $.busyLoadFull("hide");
    }
}

function cleanResult(){
    $("#bt_rs_balance").text("")
    $("#bt_rs_capital").text("")
    $("#bt_rs_curMA").text("")
    $("#bt_rs_curPrice").text("")
    $("#bt_rs_curStatus").text("")
    $("#bt_rs_volMUL").text("")
    $("#bt_rs_start").text("")
    $("#bt_rs_end").text("")
    $("#bt_rs_ttBuy").text("")
    $("#bt_rs_ttSell").text("")
    $("#bt_rs_ttRor").text("")
}