const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const stylesPath = path.join(__dirname, 'styles');
const bundlePath = path.join(__dirname, 'project-dist', 'bundle.css');
let filesPathsObj = {};

async function mergeStyles(folderPath) {
  const styleFiles = await fsPromises.readdir(folderPath, { withFileTypes: true });
  for (const file of styleFiles) {
    let extension = path.extname(file.name);
    if (file.isFile() && extension == '.css') {
      filesPathsObj[file.name] = { defaultFilePath: path.join(folderPath, file.name), content: [] };
    }
  }
}

async function readFile() {
  for (const key in filesPathsObj) {
    let readFile = new fs.ReadStream(filesPathsObj[key].defaultFilePath, { encoding: 'utf-8' });
    readFile.on('readable', () => {
      let data = readFile.read();
      if (data != null) {
        createFile(data);
      };
    });
  }
}

async function createFile(data) {
  fs.appendFile(
    bundlePath,
    data,
    (err) => {
      if (err) throw err;
    });
}

fs.writeFile(
  bundlePath,
  '',
  (err) => {
    if (err) throw err;
  }
);

mergeStyles(stylesPath).then(() => {
  readFile()
})