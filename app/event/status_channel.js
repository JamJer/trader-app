/**
 * Here is the Render Process running in frontend (webview)
 * 
 * cooperate with status.html only
 */
const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();
const storage = require('electron-json-storage');
const path = require('path');
const url = require('url');
const $  = require( 'jquery' );
const dt = require( 'datatables.net' )();

const utils = require('../utils/ui')

ipcRenderer.send('update_bot_status',{})

setInterval(function(){
    // send message to update table
    ipcRenderer.send('update_bot_status',{})
},30000)

// DataTable variable
var botStatusTable
var botsTradeBuyRecordsTable
var botsTradeSellRecordsTable

// DataTable initialization
botStatusTable = $('#bot_status_table').DataTable( {
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
            { title: "BOT ID" },
            { title: "DETAILS" },
            { title: "MANAGEMENT" }
        ]
} );

botsTradeBuyRecordsTable = $('#bots_buy_records_table').DataTable( {
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
            { title: "BOT ID" },
            { title: "TIMESTAMP" },
            { title: "POLICY USED" },
            { title: "SYMBOL" },
            { title: "QUANTITY" },
            { title: "PRICE" },
            { title: "BUY" }
        ]
} );

botsTradeSellRecordsTable = $('#bots_sell_records_table').DataTable( {
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
            { title: "BOT ID" },
            { title: "TIMESTAMP" },
            { title: "POLICY USED" },
            { title: "SYMBOL" },
            { title: "QUANTITY" },
            { title: "PRICE" },
            { title: "SELL" },
            { title: "ROR" },
            { title: "STATUS" }
        ]
} );

/**
 * Create bot instance event
 */
let bot = document.querySelector('#bot')
bot.addEventListener("submit",function(event){
    event.preventDefault();
    // send event to ipcMain, create bot instance
    let trading_policy_id = document.getElementById("trading_policy_id").value;
    console.log("Specified the file id: " + trading_policy_id);
    
    ipcRenderer.send('create_bot',{
        /** TODO: create bot with specified:
         * @param url
         * @param options (need to discuss)
         */
        url: trading_policy_id
    })
})

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

    // drop
	// let list = document.getElementById("bot_status_table")
	// while (list.firstChild) {
	// 	list.removeChild(list.firstChild);
 //    }
    // Clean Bot Table before every update
    botStatusTable.clear()
    botsTradeBuyRecordsTable.clear()
    botsTradeSellRecordsTable.clear()

    for(let i in arg.id_queue){
        // let tr = document.createElement("TR");

        // let td=document.createElement("TD")
        // td.innerHTML = arg.id_queue[i]
        // tr.appendChild(td)
        // let detail=document.createElement("TD")
        // detail.innerHTML = "[WIP]"
        // tr.appendChild(detail)
        // let btn_td=document.createElement("TD")
        // let btn = document.createElement("BUTTON")
        // btn.setAttribute("class","btn btn-danger")
        // btn.innerHTML = "Kill Bot"
        // // btn.setAttribute("onclick","call_kill(\""+arg.id_queue[i]+"\")");
        // btn.addEventListener("click",function(event){
        //     console.log("Killing ... id=",arg.id_queue[i])
        //     // send the killing signal to event.js
        //     ipcRenderer.send('kill_bot',{
        //         id: arg.id_queue[i]
        //     })
        // })
        // btn_td.appendChild(btn)
        // tr.appendChild(btn_td)
        //Delete buttons
        let d_btn = '<button type="button" class="btn btn-danger btn-sm dt-delete"><i class="fas fa-minus-circle" style="font-size: 20px;"></i></button>'
        let e_btn = '<button type="button" class="btn btn-primary btn-sm dt-edit"><i class="fas fa-sliders-h" style="font-size: 20px;"></i></button>'
        let mn_btn = e_btn+"&nbsp;"+d_btn
        let dt_arr = [
            arg.id_queue[i].id,
            arg.id_queue[i].detail,
            mn_btn
        ]
        // append into target
        // document.getElementById("bot_status_table").appendChild(tr)
        botStatusTable.row.add(dt_arr).draw();
    }

    storage.keys(function(error, keys) {
      if (error) throw error;
      for (let k in keys) {
        console.log("BB: "+keys[k])
        storage.get(keys[k], function(error, data) {
            if (error) throw error;
            console.log("GG: "+keys[k])
            // console.log("Bot "+arg['id']+"local trade record: "+data)
            for(let i in data){
                if(data[i].type == "buy"){
                    let insert_row = [keys[k],data[i].timeStamp,data[i].tradePolicy,data[i].symbol,data[i].quantity,data[i].price,data[i].buy];
                    botsTradeBuyRecordsTable.row.add(insert_row).draw();
                }
                else if(data[i].type == "sell"){
                    let insert_row = [keys[k],data[i].timeStamp,data[i].tradePolicy,data[i].symbol,data[i].quantity,data[i].price,data[i].sell,data[i].ror,data[i].status];
                    botsTradeSellRecordsTable.row.add(insert_row).draw();
                }
            }
        });
      }
    });

    //Delete buttons event (Only works here....)
    $('.dt-delete').each(function () {
        $(this).on('click', function(evt){
            $this = $(this);
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
    });

    // Add edit page 
    $('.dt-edit').each(function () {
        $(this).on('click', function(evt){
            $this = $(this);
            var data = botStatusTable.row( $(this).parents('tr') ).data();
            // will enter bot instance status
            ipcRenderer.send('edit_bot',{
                id: data[0]
            })
            ipcRenderer.send('update_bot_status',{})
        });
    });
})


ipcRenderer.on("bot_instance_start",(event,arg)=>{
    // enter bot instance page
    window.location.href="bot_instance.html";
})