const fs = require('fs');

const saveFile = async (filename, text) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, text, (err) => {
      if (err) {
        return reject(err)
      }
      return resolve(text);
    });
  })
};

const readFile = async (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, "utf8", (err, text) => {
      if (err) {
        return reject(err)
      }
      return resolve(text);
    });
  })
};

module.exports = {
  readFile,
  saveFile
};