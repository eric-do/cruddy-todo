const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');
var fsAync = Promise.promisifyAll(fs);

var items = {};
// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  // Input: todo text and a callback function
  // Pass getNextUniqueId with a callback to:
  //  Create file with ID value
  //  Put todo text into file

  counter.getNextUniqueId((err, fileName) => {
    if (err) { return callback(err); }
    var filepath = path.join(exports.dataDir, `${fileName}.txt`);
    fs.writeFile(filepath, text, err => {
      if (err) { return callback(err); }
      var todo = {
        id: fileName,
        text: text
      };
      callback(null, todo);
    });
  });
};

exports.readAll = (callback) => {
  // Input: a callback function
  // Read file directory passing in an anon function
  // Create a new array
  // For each file read
  //  Define basename and filepath
  //  Return a new promise made from
  //   fs.readFile
  //   resolve into an object with id and text
  // Run promise.all on the new array, 
  // execute callback on the aggregated result
  fs.readdir(exports.dataDir, (err, fileArr) => {
    if (err) { return callback(err); }
    var promises = fileArr.map(file => {
      var basename = path.basename(file, '.txt');
      var filepath = path.join(exports.dataDir, file);

      return new Promise((resolve, reject) => {
        fs.readFile(filepath, 'utf8', (err, data) => {
          if (err) { reject(err); }
          resolve({
            id: basename,
            text: data
          });
        });
      });
    });
    Promise.all(promises).then(result => {
      callback(null, result);
    });
  });
};

exports.readOne = (id, callback) => {
  exports.readAll((err, files) => {
    if (err) { return callback(err); }
    var found = files.find(element => {
      return element.id === id;
    });
    if (found) {
      var filepath = path.join(exports.dataDir,`${id}.txt`);
      fs.readFile(filepath, (err, data) => {
        if (err) { return callback(err); }
        found.text = data.toString('utf8');
        callback(null, found);
      });
    } else { callback( new Error ("Error reading file")); }
  });
};

exports.update = (id, text, callback) => {
  exports.readOne(id, (err, data) => {
    if (err) { return callback(err); }
    data.text = text;
    var filepath = path.join(exports.dataDir, `${id}.txt`);
    fs.writeFile(filepath, text, (err, data) => {
      if (err) { return callback(err); }
      callback(null, data);
    });
  });
};

exports.delete = (id, callback) => {
  exports.readOne(id, (err, data) => {
    if (err) { return callback(err); }
    var filepath = path.join(exports.dataDir, `${id}.txt`);
    fs.unlink(filepath, err => {
      if (err) { return callback(err); }
      callback(null);
    });
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
