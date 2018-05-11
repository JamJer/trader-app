/**
 * Utilities used in control_channel.js
 */

const utils={};

// Create display block in display 
utils.create_block = function(title,desc,display_id){
    let node=document.createElement("A")
    node.href="#"
    node.setAttribute("class","list-group-item list-group-item-action flex-column align-items-start")
    let wrapper=document.createElement("DIV")
    wrapper.setAttribute("class","d-flex w-100 justify-content-between");
    let cmd_title=document.createElement("H5");
    cmd_title.setAttribute("class","mb-1")
    cmd_title.innerHTML=title;
    let cmd_desc=document.createElement("P");
    cmd_desc.setAttribute("class","mb-1")
    cmd_desc.innerHTML=desc;
    wrapper.appendChild(cmd_title)
    node.appendChild(wrapper)
    node.appendChild(cmd_desc)
    // Append into display block
    document.getElementById(display_id).appendChild(node);
}

module.exports = utils;