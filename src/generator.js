#!/usr/bin/env node

// Libraries
var fs      = require('fs-extra');
var schema  = require('protocol-buffers-schema');

// Handlers
var handleEnum = require('./enum');
var handleMessage = require('./message');

function generator(protoLocation, outputLocation, resolveImport) {
  var protoJSON = schema.parse(fs.readFileSync(protoLocation));

  const imports = [];

  // Resolve the imports
  protoJSON.imports.forEach((importPath) => {
    const resolve = resolveImport(importPath);

    imports.push({
      import: resolve.importPath,
      proto: schema.parse(fs.readFileSync(resolve.proto))
    });
  });


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

  const tsImports = [];
  const tsClasses = [];

  // Create classes for the individual messages
  protoJSON.messages.forEach(message => {
    const result = handleMessage(message, protoJSON.messages, globalEnums, imports); 
    tsImports.push(result.imports);
    tsClasses.push(result.class);
  });

  // Handle the imports
  const importObjects = {};

  tsImports.forEach((tsImport) => {
    Object.keys(tsImport).forEach((importKey) => {
      if (!importObjects[importKey]) {
        importObjects[importKey] = [...tsImport[importKey]];
      } else {
        tsImport[importKey].forEach((message) => {
          if (importObjects[importKey].indexOf(message) === -1) {
            importObjects[importKey].push(message);
          }
        });
      }
    }); 
  });

  Object.keys(importObjects).forEach((importPath) => {
    tsOutput += `import { ${importObjects[importPath].join(', ')} } from '${importPath}';\n`;
  });

  // Add enums
  tsOutput += enums;


  // Add classes to the file
  tsClasses.forEach((tsClass) => {
    tsOutput += tsClass;
  });


  // Write the TypeScript file and remove temp json file
  if (outputLocation) {
    fs.writeFileSync(outputLocation, tsOutput);
  } else {
    fs.writeFileSync(`${protoLocation.split('.proto')[0]}.ts`, tsOutput);
  }

  return tsOutput;
}

module.exports = {
  generate: generator
};




