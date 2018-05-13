# Trader APP

## 檔案配置

> 存在於專案原始碼當中

* app/ 底下是 electron webview (render process)
    * config/ -> render process 的配置檔
    * event/ -> render process 的 ipc 
    * img/ -> 圖源
    * lib/ -> 前端網頁需要的 library 
* src/ 底下是 electron main process
    * config/ -> main process 的配置檔
    * model/ -> 除 main process 外的其他功能
    * ui/ -> main process / ipcMain （主進入點）
    * ~~db/ -> 主要放置 sqlite3 所使用~~
        * 考慮到 release 後的程式不會有相對應的檔案夾配置，直接配置在跟本身 main.js 同個位置即可(跟 electron build 所得到的程式同層)

> 啟動後自動產生

* `.local/` 
    * 用來儲存本地端較大檔案、紀錄檔等等資訊
    * 在程式呼叫啟動時產生
    * 由執行檔程式來指定存放位置（不會有相對路徑問題）

## Debug Mode 

* 由於本身 app 需要在啟動 trader-server 與 trade-server-db 這兩個服務下才可以使用，所以為了加快啟動速度，提供腳本做運行
    * `注意！`： 在 start 啟動後，需要透過 `check` 來檢查狀態！
    * 確認所有的 service 都開啟後在啟動 app
```
# 啟動兩個服務於背景
./debugger.sh start

# 檢查狀態，是否成功運行
./debugger.sh check

# 砍掉兩個在背景運行的 process
./debugger.sh stop
```

* 注意： 在 `trade-server-db` 內，裡頭的 database 需要先做註冊一組使用者！
    * 參考該專案內的說明！

## sqlite3

在配置當下需要重新編譯的動作，目前指令放置於 package.json 內的 `postinstall`. 將於 npm install 後執行

目前測試於 linux 環境下可以正確執行

適合當作客戶端的小型資料庫使用

### linux 上察看 sqlite3

* 安裝 GUI - `sqlitebrowser`

```bash
sudo add-apt-repository -y ppa:linuxgndu/sqlitebrowser
sudo apt update 
sudo apt install sqlitebrowser
```

### window 環境下使用

* 針對 sqlite3 做處理 - https://hackmd.io/lNpg8-HYSH2UsZUSJCNNMg 
    * 解決 sqlite3 重新編譯問題
    * 測試於 window 10 環境 （version: `1709`）