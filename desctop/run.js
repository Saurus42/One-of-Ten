(()=>{"use strict";var e={298:e=>{e.exports=require("electron")}},r={};function o(t){var n=r[t];if(void 0!==n)return n.exports;var i=r[t]={exports:{}};return e[t](i,i.exports,o),i.exports}(()=>{const e=o(298);e.app.commandLine.appendSwitch("ignore-certificate-errors"),e.app.on("ready",(r=>{new e.BrowserWindow({width:1300,height:700,webPreferences:{nodeIntegration:!0,contextIsolation:!1}}).loadFile("./public/index.html")})),e.app.on("window-all-closed",(()=>{e.app.quit()}))})()})();