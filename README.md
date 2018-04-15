# Trader APP

## 檔案配置

* app/ 底下是 electron webview (render process)
    * config/ -> render process 的配置檔
    * event/ -> render process 的 ipc 
    * img/ -> 圖源
    * lib/ -> 前端網頁需要的 library 
* src/ 底下是 electron main process
    * config/ -> main process 的配置檔
    * model/ -> 除 main process 外的其他功能
    * ui/ -> main process / ipcMain （主進入點）
    * db/ -> 主要放置 sqlite3 所使用


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