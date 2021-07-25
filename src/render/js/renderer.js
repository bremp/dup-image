const { ipcRenderer } = require("electron");

// local dependencies
const dom = require("../js/dom");

/*****************************/

// get list of files from the `main` process
ipcRenderer.invoke("app:get-files").then((files = []) => {
  dom.displayFiles(files);
  console.log("get list of files from the `main` process");
});

// handle file delete event
ipcRenderer.on("app:delete-file", (event, filename) => {
  document.getElementById(filename).remove();
});

/*****************************/

// open filesystem dialog
window.openDialog = () => {
  ipcRenderer.invoke("app:on-fs-dialog-open").then(() => {
    ipcRenderer.invoke("app:get-files").then((files = []) => {
      dom.displayFiles(files);
    });
  });
};
