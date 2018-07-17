/**
 * 交易機器人交易紀錄 (Client端儲存)
 * 
 */
const storage = require('electron-json-storage');
const bot_trade_recording = {}
const BOT_RECORD_MAX_ROW_LIMIT = 10

const dataPath = storage.getDataPath();
console.log("Bot trade records LocalStorage Path: "+dataPath);

bot_trade_recording.pushIntoTradeRecord = function (bot_id ,trade_json) {
	storage.has(bot_id, function(error, hasKey) {
	  if (!hasKey) {
	  	setBotRecordsToLocal(bot_id,[trade_json])
	  	console.log('Bot id: '+bot_id+ ' local store has been created.')
	  }else{
	  	storage.get(bot_id, function(error, data) {
	        console.log(data)   			
			if(data.length >= BOT_RECORD_MAX_ROW_LIMIT){
				data.shift()
			}
			data.push(trade_json)
			console.log(data)
			setBotRecordsToLocal(bot_id,data)
		});
	  }
	});
}

bot_trade_recording.deleteBotRecordFromLocal = function(bot_id){
	storage.remove(bot_id, function(error) {
	  if (error) throw error;
	  console.log("Bot id: "+bot_id+" has been remove from LocalStorage")
	});
}

bot_trade_recording.showBotStoreListInLocal = function(){
	storage.keys(function(error, keys) {
	  if (error) throw error;

	  for (var key of keys) {
	    console.log('There is a key called: ' + key);
	  }
	});
}

bot_trade_recording.initailizeLocalBotRecord = function(bot_id){
	setBotRecordsToLocal(bot_id,[])
	console.log('Bot id: '+bot_id+ ' local store has been created.')
}

function setBotRecordsToLocal(bot_id,trade_json){
	storage.set(bot_id, trade_json, function(error) {
	});
}

module.exports = bot_trade_recording;
