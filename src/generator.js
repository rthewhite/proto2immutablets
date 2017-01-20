#!/usr/bin/env node

// Libraries
var fs      = require('fs-extra');
var schema  = require('protocol-buffers-schema');

// Handlers
var handleEnum = require('./enum');
var handleMessage = require('./message');

function generator(protoLocation, outputLocation) {
  var protoJSON = schema.parse(fs.readFileSync(protoLocation));

  var globalEnums = [];

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
    fs.writeFileSync(outputLocation, tsOutput);
  } else {
    fs.writeFileSync(`${protoLocation.split('.proto')[0]}.ts`, tsOutput);
  }
}

module.exports = {
  generate: generator
};




