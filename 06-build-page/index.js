//$ Импорт всех требуемых модулей
//$ Прочтение и сохранение в переменной файла-шаблона
//$ Нахождение всех имён тегов в файле шаблона
//$ Замена шаблонных тегов содержимым файлов-компонентов
// Запись изменённого шаблона в файл index.html в папке project-dist
// Использовать скрипт написанный в задании 05-merge-styles для создания файла style.css
// Использовать скрипт из задания 04-copy-directory для переноса папки assets в папку project-dist

const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

// template file path
const TEMPLATE_FILE = path.join(__dirname, 'template.html');
const COMPONENTS_FOLDER = path.join(__dirname, 'components');
const HTML_TARGET_PATH = path.join(__dirname, 'project-dist', 'index.html');

//@ создание HTML из компонентов
async function htmlBundle() {
  //@ записываем в переменную содержимое template.html
  let templateFileContent = await fsPromises.readFile(TEMPLATE_FILE, 'utf-8');

  //@ ищем все компоненты и если это html, записываем каждый в переменную (свойство объекта)
  let components = {};
  const componentsDilent = await fsPromises.readdir(COMPONENTS_FOLDER, { withFileTypes: true });
  for (const file of componentsDilent) {
    const extension = path.extname(file.name);
    const filePath = path.join(COMPONENTS_FOLDER, file.name);
    if (file.isFile() && extension == '.html') {
      const fileNameWithoutExtension = file.name.replace(extension, '');
      components[fileNameWithoutExtension] = await fsPromises.readFile(filePath, 'utf-8');
    }
  }

  //@ ищем модули, которые нужно заменить и заменяем (если есть соответствующий файл)
  // с помощью регулярного выражения для вхождений типа {{имя_компонента}}
  const regexp = /\{\{[A-Za-z0-9_-]*\}\}/g;
  // создаем массив из всех вхождений
  let found = templateFileContent.matchAll(regexp);
  // проходимся по массивы
  for (const item of found) {
    const compName = item[0].slice(2, -2);
    if (components[compName]) {
      // заменяем на соответсвующий компонент
      templateFileContent = templateFileContent.replace(item[0], components[compName]);
    }
  }
  return templateFileContent;
}




//@ создание папки project-dist, копировать assets в project-dist
const newDirName = 'project-dist';
const currentDirName = 'assets';
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
      await copyFolder(path.join(current, fileToCopy.name), path.join(targetPath, fileToCopy.name));
    }
  }
}
async function copyFolder(copyFrom, copyTo) {
  fsPromises.mkdir(copyTo, (err) => {
    if (err == 'EEXIST') {
      console.log('Directory already exists.\nWill delete current folder and recreate it');
    }
    if (err) console.log('mkdir ERROR');
  }).then(
    () => {
      copyDir(copyFrom, path.join(copyTo));
    },
    () => {
      deleteFolder(copyTo).then(() => copyFolder(copyFrom, copyTo))
    });
}
async function createDirectory(path) {
  return fsPromises.mkdir(path, (err) => {
    if (err == 'EEXIST') {
      console.log('Directory already exists.\nWill delete current folder and recreate it');
    }
    if (err) console.log('mkdir ERROR');
  }).then(
    () => console.log('Directory created!', path),
    () => deleteFolder(path).then(() => createDirectory(path))
  )
}





//@ объединение стилей и запихивание их в нужную папку
const stylesPath = path.join(__dirname, 'styles');
const bundlePath = path.join(__dirname, 'project-dist', 'style.css');
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
        writeToFile(bundlePath, data);
      };
    });
  }
}

async function writeToFile(path, data) {
  fs.appendFile(
    path,
    data,
    (err) => {
      if (err) throw err;
    });
}

async function createFile(path) {
  return fsPromises.writeFile(
    path,
    '',
    (err) => {
      if (err) throw err;
    }
  )
}



//@ MAIN BLOCK

createDirectory(newDirPath)
  .then(
    () => copyFolder(copyFromDirPath, path.join(newDirPath, currentDirName))
  ).then(
    () => createFile(bundlePath)
  ).then(
    () => mergeStyles(stylesPath).then(() => {
      readFile()
    })
  ).then(
    () => createFile(HTML_TARGET_PATH).then(
      () => htmlBundle().then(
        (data) => writeToFile(HTML_TARGET_PATH, data)
      )
    )
  )


