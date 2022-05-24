const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const newDirName = 'files-copy';
const currentDirName = 'files';
const newDirPath = path.join(__dirname, newDirName);
const copyFromDirPath = path.join(__dirname, currentDirName);

async function deleteFolder(toDelFolderPath) {
  const files = await fsPromises.readdir(toDelFolderPath, { withFileTypes: true });
  for (const file of files) {
    if (file.isFile()) {
      console.log('Deleting the file  ', path.join(toDelFolderPath, file.name), '...');
      await fsPromises.rm(path.join(toDelFolderPath, file.name));
    } else await deleteFolder(path.join(toDelFolderPath, file.name));
  }
  console.log('Deleting the folder  ', toDelFolderPath, '...');
  await fsPromises.rmdir(toDelFolderPath);
}

async function copyDir(current, targetPath) {
  console.log('Begin the copeing...');
  const filesToCopy = await fsPromises.readdir(current, { withFileTypes: true });
  // console.log(filesToCopy);
  for (const fileToCopy of filesToCopy) {
    // console.log(fileToCopy.isFile());
    if (fileToCopy.isFile()) {
      try {
        await fsPromises.copyFile(path.join(current, fileToCopy.name), path.join(targetPath, fileToCopy.name));
        console.log(`${fileToCopy.name} was copied to ${targetPath}`);
      } catch {
        console.log('The file could not be copied');
      }
    } else {
      // await copyDir(path.join(current, fileToCopy.name), path.join(targetPath, fileToCopy.name));
      await createFolder(path.join(current, fileToCopy.name), path.join(targetPath, fileToCopy.name));
    }
  }
}
async function createFolder(copyFromDirPath, newDirPath) {
  fsPromises.mkdir(newDirPath, (err) => {
    if (err == 'EEXIST') {
      console.log('Directory already exists.\nWill delete current folder and recreate it');
    }
    if (err) console.log('mkdir ERROR');
}).then(
  () => {
    copyDir(copyFromDirPath, newDirPath);
  },
  () => {
    deleteFolder(newDirPath).then( () => createFolder(copyFromDirPath, newDirPath))
  });
}

createFolder(copyFromDirPath, newDirPath);
