import { app, BrowserWindow } from 'electron';

var window: BrowserWindow;

app.commandLine.appendSwitch( 'ignore-certificate-errors' );

app.on( 'ready', event => {
  window = new BrowserWindow( {
    width: 1300,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  } );
  window.loadFile( './public/index.html' );
} );

app.on( 'window-all-closed', () => {
  app.quit();
} );