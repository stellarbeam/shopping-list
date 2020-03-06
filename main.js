const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

// When app is ready
app.on("ready", () => {

    // Create a window
    mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(app.getAppPath(), 'preload.js')
        }
    });

    // Load url
    mainWindow.loadURL(url.format({
        protocol: "file:",
        pathname: path.join(__dirname, "mainWindow.html"),
        slashes: true
    }));

    mainWindow.on('closed', () => {
        app.quit();
    })

    // Add a menu
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
})

function createAddWindow() {
    // Create a window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: "Add an item to shopping list",
        webPreferences: {
            preload: path.join(app.getAppPath(), 'preload.js')
        }
    });

    // Load url
    addWindow.loadURL(url.format({
        protocol: "file:",
        pathname: path.join(__dirname, "addWindow.html"),
        slashes: true
    }));

    // Garbage collection
    addWindow.on('closed', () => {
        addWindow = null;
    })
}

// Catch item from ipcRenderer
ipcMain.on('item:add', (e, itemName) => {
    mainWindow.webContents.send('item:add', itemName);
    addWindow.close();
})

const mainMenuTemplate = [
    {
        label: "File",
        submenu: [
            {
                label: "Add item",
                click: () => {
                    createAddWindow();
                }
            },
            {
                label: "Clear all items",
                click: () => {
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: "Quit",
                accelerator: process.platform == 'darwin' ? "Command+Q" : "Ctrl+Q", 
                click: () => {
                    app.quit();
                }
            }
        ]
    }
]

if(process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle Developer Tools',
                accelerator: process.platform == 'darwin' ? "Command+I" : "Ctrl+I", 
                click: (item, focusedWindow) => {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}