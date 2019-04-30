const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};
// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  // Input: todo text and a callback function
  // Pass getNextUniqueId with a callback to:
  //  Create file with ID value
  //  Put todo text into file

  counter.getNextUniqueId((err, fileName) => {
    if (err) { throw "Error"; }
    var filepath = path.join(exports.dataDir, `${fileName}.txt`);
    //console.log(`Creating: ${fileName}.txt \n${text}\n`);
    fs.writeFile(filepath, text, err => {
      //console.log(`Done: ${fileName}.txt \n${text}\n`);
      if (err) { throw "Error"; }
      var todo = {
        id: fileName,
        text: text
      };
      callback(err, todo);
    });
  });
};

exports.readAll = (callback) => {
  var files = fs.readdirSync(exports.dataDir);
  var filesArr = files.map(file => {
    var basename = path.basename(file, '.txt');
    return {
      id: basename,
      text: basename
    };
  });  
  callback(null, filesArr);
};

exports.readOne = (id, callback) => {
  exports.readAll((err, files) => {
    var found = files.find(element => {
      return element.id === id;
    });
    if (found) {
      var filepath = path.join(exports.dataDir,`${id}.txt`);
      fs.readFile(filepath, (err, data) => {
        if (err) {
          callback( new Error ("Error reading file")); 
        }
        found.text = data.toString('utf8');
        callback(null, found);
      });
    }
    else { callback( new Error ("Error reading file")); }
  });
};

exports.update = (id, text, callback) => {
  var item = items[id];
  if (!item) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    items[id] = text;
    callback(null, { id, text });
  }
};

exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
