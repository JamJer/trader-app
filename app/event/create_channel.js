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

// fetch global variable
var policyList = $("#policy-list");
var editor;
var isSaved = true;
var nowFile = "";
const policy_path = './.local/policy';
const fs = require('fs');

/**
 * Editor - 
 * 
 * With communication with backend
 * @func initPolicyList - fetch and list the policies 
 * @func refleshPolicyList - refresh the policy board
 * @func readSingleFile 
 * @func setPolicyToEditor
 * @func saveFiles
 * @func deleteFiles
 * 
 * Without communication with backend
 * @func initAceEditor
 * @func clearEditor
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
    ipcRenderer.send("policy_list",{})
}

ipcRenderer.on("response_policy_list",(event,arg)=>{
    /**
     * @param arg.msg
     * @param arg.data
     */
    alert(arg.msg)
    if(arg.data.length != undefined){
        arg.data.forEach(file=>{
            $('<li class="list-group-item list-group-item-action" id="'+file+'">' + file + '</li>').appendTo(policyList);
        })
    }
})


function refleshPolicyList(){
    $('ul').empty();
    initPolicyList();
}

function readSingleFile(e) {
    if(!isSaved){
        if (confirm("Save this Policy before upload another Policy?")){
            var title = document.getElementById('file-name').innerText;
            saveFiles(title,editor.getValue());
        }
    }
    
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    document.getElementById('file-name').innerText = file.name; 
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        editor.setValue(contents);
        editor.session.getUndoManager().markClean();
    };
    reader.readAsText(file);
    $("#file-input").val('');
}

function initAceEditor() {
    editor = ace.edit("aceEditor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/yaml");
    editor.getSession().setOptions({newLineMode: "auto"});
    editor.setFontSize("15px") ;
    editor.setPrintMarginColumn(false);
    editor.setOptions({
        autoScrollEditorIntoView: true,
        copyWithEmptySelection: true,
        animatedScroll: true
    })
    editor.setOption("mergeUndoDeltas", "always");
}

function clearEditor(){
    editor.setValue("");
}

function setPolicyToEditor(policy_name){
    var csvRequest = new Request({
        url:"../.local/policy/"+policy_name,
        onSuccess:function(response){
            editor.setValue(response);
            editor.session.getUndoManager().markClean();
        }
    }).send();
}

function saveFiles(file_name,file_data){
    // sending ipc request to backend
    ipcRenderer.send('policy_save',{
        filename: file_name,
        filedata: file_data
    })
}

ipcRenderer.on("response_policy_save",(event,arg)=>{
    /**
     * @param arg.msg
     * @param arg.data
     */
    alert(arg.msg)
    refleshPolicyList();
    // marked as clean
    editor.session.getUndoManager().markClean();
    isSaved = true;
})

function deleteFiles(file_name){
    if (confirm("Sure to Delete this Policy?")) {
        // sending request to backend
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
    alert(arg.msg)
    clearEditor();
    refleshPolicyList();
    // marked as clean
    editor.session.getUndoManager().markClean();
    isSaved = true;
})

// initial Ace Editor
initAceEditor();
editor.session.getUndoManager().reset();

//This event is called when the DOM is fully loaded
window.addEvent("domready",function(){
    initPolicyList();
});

//Event goes here
document.getElementById("policy-list").addEventListener("click",function(e) {
if(!editor.session.getUndoManager().isClean()){
    if (confirm("Save this Policy before open another Policy?")){
        var title = document.getElementById('file-name').innerText;
        saveFiles(title,editor.getValue());
        editor.session.getUndoManager().reset();
        }
    }
    if(e.target && e.target.nodeName == "LI") {
        setPolicyToEditor(e.target.id);
        document.getElementById('file-name').innerText = e.target.id;
        isSaved = false;
    }
});

$(document).on('change','#file-input',function(e){ 
    readSingleFile(e); 
});


$( "#file-save" ).click(function() {
    var title = document.getElementById('file-name').innerText;
    saveFiles(title,editor.getValue());
});

$( "#file-discard" ).click(function() {
    var title = document.getElementById('file-name').innerText;
    deleteFiles(title);
});