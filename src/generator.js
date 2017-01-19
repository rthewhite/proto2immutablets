#!/usr/bin/env node
var fs = require('fs');
var exec = require('child_process').exec;

var handleEnum = require('./enum');
var handleMessage = require('./message');


function generator(protoLocation, outputLocation) {

  var globalEnums = [];

  child = exec(`pbjs ${protoLocation} --decode > temp.json`, function(error, stdout, stderr) {
    var protoJSON = JSON.parse(fs.readFileSync('./temp.json', 'utf8'));

    var tsOutput = `// !!!!!!!!!!!!!! WARNING WARNING WARNING!!!!!!!!!!!!!
//    THIS IS GENERATED CODE, DO NOT EDIT DIRECTLY!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! \n`;

    tsOutput += `import { Map, List, fromJS } from 'immutable'; \n\n`;

    var enums = '';

    // Let's get all the global enums first
    if ( protoJSON.enums) {
      protoJSON.enums.forEach(enm => {
        globalEnums.push(enm.name);
        enums += handleEnum(enm);
      });
    }

    // Get the individual field enums
    protoJSON.messages.forEach(message => {
      if (message.enums) {
        message.enums.forEach(enm => {
          enums += handleEnum(enm, message);
        });
      }
    });

    tsOutput += enums;

    // Create classes for the individual messages
    protoJSON.messages.forEach(message => {
      tsOutput += handleMessage(message, globalEnums);
    });

    // Write the TypeScript file and remove temp json file
    if (outputLocation) {
      fs.writeFile(`${outputLocation}/models.ts`, tsOutput);
    } else {
      fs.writeFile(`./${protoLocation.split('.proto')[0]}.ts`, tsOutput);
    }

    // Clean up the temporary json file
    fs.unlink('temp.json');
  });
}

module.exports = {
  generate: generator
};




