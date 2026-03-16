import { app, BrowserWindow } from 'electron';
import { killServer, startServer } from './server';
import { isDevelopment } from './utils';

async function createWindow() {
    const port = await startServer(app.getAppPath());

    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    win.loadURL(`http://localhost:${port}`);
    if (isDevelopment) win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    killServer();
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', killServer);
