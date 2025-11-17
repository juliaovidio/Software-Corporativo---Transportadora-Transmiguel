const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,  // largura inicial
    height: 300, // altura inicial
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.maximize(); // abre a janela maximizada
  win.loadURL('http://localhost:4040');
}

app.whenReady().then(() => {
  require('./server/app'); // inicia seu servidor
  createWindow();
});
