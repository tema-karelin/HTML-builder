const process = require('process');
const fs = require('fs');
const path = require('path');
const { stdin, stdout } = process;

const textFileFullName = path.join(__dirname, 'your-text.txt');

function onExit() {
  console.log('\nThank you for your job! Good luck!\n')
};

fs.writeFile(
  textFileFullName,
  '',
  (err) => {
    if (err) throw err;
    console.log('\n - Data will be added in your-file.txt\n - To add a new line press "enter"\n - To finish input job write "exit" or press Ctrl+C\nWrite your text here, please:\n');
  }
);
stdin.on('data', (data) => {
  if (data.toString().slice(0, -2) === 'exit') {
    onExit();
    process.exit(1);
  } else {
    fs.appendFile(
    textFileFullName,
    data,
    (err) => {
      if (err) throw err;
    });
  }
});
process.on('SIGINT', () => {
  onExit();
  process.exit(1);
});
