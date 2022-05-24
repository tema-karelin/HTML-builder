const fs = require('fs');
const path = require('path');
const fsPromoses = require('fs/promises');

const targetDir = path.join(__dirname, 'secret-folder');

console.log("\nList of files in secret-folder directory:\n");

async function readDirectory(dir) {
  try {
    const files = await fsPromoses.readdir(dir, {withFileTypes: true});
    for (const file of files) {
      if (file.isFile()) {
        let extension  = path.extname(file.name);
        // let line = '               -     - ';
        let line = '';
        const fileName = file.name.slice(0, file.name.indexOf(extension));
        extension = extension.slice(1);
        // line = fileName + line.slice(fileName.length) + extension;
        line = fileName + ' - ' + extension + ' - ';
        const filePath = path.join(dir, file.name);
        fs.stat(filePath, (err, stats) => {
          line = line + (stats.size/1024).toFixed(3).toString() + 'kb';
          console.log(line);
        });
      }
    };
  } catch (err) {
    console.error(err);
  }
}

readDirectory(targetDir);



