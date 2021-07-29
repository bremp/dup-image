const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

// local dependencies
const io = require("./main/io");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

// open a window
const openWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // enableRemoteModule: true,
    },
  });

  // and load the index.html of the app.
  win.loadFile(path.resolve(__dirname, "render/html/index.html"));

  // Open the DevTools.
  win.webContents.openDevTools();
  return win; // return window
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  const win = openWindow();

  // watch files
  io.watchFiles(win);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    openWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

/************************/

// return list of files
ipcMain.handle("app:get-files", () => {
  return io.getFiles();
});

// listen to file(s) add event
ipcMain.handle("app:on-file-add", (event, files = []) => {
  io.addFiles(files);
});

// open filesystem dialog to choose folder.
ipcMain.handle("app:on-fs-dialog-open", (event) => {
  console.log("Handle dialog open");
  const files = dialog.showOpenDialogSync({
    properties: ["openDirectory"],
  });

  if (files) {
    const dir = files.shift();
    console.log("Selected folder: %s", dir);
    const images = io.getFiles(dir);
    console.log(images);
    // io.addFiles(
    //   files.map((filepath) => {
    //     return {
    //       name: path.parse(filepath).base,
    //       path: filepath,
    //     };
    //   })
    // );
  }
});

/*-----*/

// listen to file delete event
ipcMain.on("app:on-file-delete", (event, file) => {
  io.deleteFile(file.filepath);
});

// listen to file open event
ipcMain.on("app:on-file-open", (event, file) => {
  io.openFile(file.filepath);
});

// listen to file copy event
ipcMain.on("app:on-file-copy", (event, file) => {
  event.sender.startDrag({
    file: file.filepath,
    icon: path.resolve(__dirname, "./resources/paper.png"),
  });
});
