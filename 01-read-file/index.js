const path = require('path');
const fs = require('fs');

let readFile = new fs.ReadStream(path.join(__dirname, 'text.txt'), {encoding: 'utf-8'});

readFile.on('readable', () => {
  let data = readFile.read();
  if (data != null) console.log(data);
});
