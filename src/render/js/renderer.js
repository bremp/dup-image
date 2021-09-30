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
  ipcRenderer.invoke("app:on-fs-dialog-open").then((dir) => {
    // console.log("In renderer. Invoking dialog open: " + dir);
    // ipcRenderer.invoke("app:get-files").then((files = []) => {
    //   dom.displayFiles(files);
    //   console.log("In renderer, received list of images.");
    //   console.log(files);
    // });

    // ipcRenderer.invoke("app:find-images", dir).then((images = []) => {
    //   console.log(images);
    //   images.forEach((img) => {
    //     let _out = '<img src="file:///' + img + '" width="320" height="240" />';
    //     //render/display
    //     let _target = document.getElementById("image_container");
    //     _target.insertAdjacentHTML("beforeend", _out);
    //   });
    // });

    ipcRenderer.invoke("app:find-similar-images", dir).then((images = []) => {
      console.log(images);
      images.forEach((img) => {
        let _out = '<img src="file:///' + img + '" width="320" height="240" />';
        //render/display
        let _target = document.getElementById("image_container");
        _target.insertAdjacentHTML("beforeend", _out);
      });
    });
  });
};
