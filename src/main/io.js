const { ipcMain } = require("electron");
const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const open = require("open");
const chokidar = require("chokidar");
const jimp = require("jimp");

// local dependencies
const notification = require("./notification");

// get application directory
const appDir = path.resolve(os.homedir(), "electron-app-files");
// May want to move to caller for specifying extensions to search.
const ext = ".jpg|.jpeg|.png";
const regex = new RegExp(`\\${ext}$`, "i");

/****************************/

// get the list of image files from given directory.
findImages = (dir, files, result) => {
  files = files || fs.readdirSync(dir);
  result = result || [];

  for (let i = 0; i < files.length; i++) {
    let file = path.join(dir, files[i]);
    if (fs.statSync(file).isDirectory() && !path.extname(file)) {
      try {
        result = findFiles(file, readdirSync(file), result, regex);
      } catch (error) {
        continue;
      }
    } else {
      if (regex.test(file)) {
        result.push(file);
      }
    }
  }
  return result;
};

exports.findSimilarImages = (dir, files, result) => {
  images = findImages(dir, files, result);

  if (images.length) {
    processImages(images);
  }
  return images;
};

// TODO: Algorithm to compare the files to one another?
// https://www.codedrome.com/comparing-images-node-jimp/
async function processImages(images) {
  const results = await readImages(images);
  const length = images.length;
  for (let i = 0; i < length; i++) {
    for (let j = i + 1; j < length; j++) {
      console.log("comparing: ", images[i], images[j]);
      console.log("distance: ", jimp.distance(results[i], results[j]));
    }
  }
}

async function readImages(images) {
  let results = [];
  for (let i = 0; i < images.length; i++) {
    const img = await jimp.read(images[i]);
    results.push(img);
  }
  return results;
}

// TODO: Candidate for deprecation.
// get the list of files from directory
exports.getFiles = () => {
  const files = fs.readdirSync(appDir);

  return files.map((filename) => {
    const filePath = path.resolve(appDir, filename);
    const fileStats = fs.statSync(filePath);

    return {
      name: filename,
      path: filePath,
      size: Number(fileStats.size / 1000).toFixed(1), // kb
    };
  });
};

/****************************/

// add files
exports.addFiles = (files = []) => {
  // ensure `appDir` exists
  fs.ensureDirSync(appDir);

  // copy `files` recursively (ignore duplicate file names)
  files.forEach((file) => {
    const filePath = path.resolve(appDir, file.name);

    if (!fs.existsSync(filePath)) {
      fs.copyFileSync(file.path, filePath);
    }
  });

  // display notification
  notification.filesAdded(files.length);
};

// delete a file
exports.deleteFile = (filename) => {
  const filePath = path.resolve(appDir, filename);

  // remove file from the file system
  if (fs.existsSync(filePath)) {
    fs.removeSync(filePath);
  }
};

// open a file
exports.openFile = (filename) => {
  const filePath = path.resolve(appDir, filename);

  // open a file using default application
  if (fs.existsSync(filePath)) {
    open(filePath);
  }
};

/*-----*/

// watch files from the application's storage directory
exports.watchFiles = (win) => {
  chokidar.watch(appDir).on("unlink", (filepath) => {
    win.webContents.send("app:delete-file", path.parse(filepath).base);
  });
};
