const types = require('./types');
const utils = require('./utils');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function snakeCaseToCamelCase(str) {
  return str.replace(/(\_\w)/g, function(m){return m[1].toUpperCase();});
}

function determineType(field, message, messages, messageEnums, globalEnums, imports) {

  var messageName = capitalize(snakeCaseToCamelCase(message.name));
  var fieldName = capitalize(snakeCaseToCamelCase(field.name));
  
  if (messageEnums.indexOf(`${messageName}${fieldName}`) > -1) {
    return 'message-enum';
  }

  if (globalEnums.indexOf(field.type) > -1) {
    return 'global-enum';
  }

  if (field.repeated) {
    return 'List';
  }

  if (field.map) {
    return 'Map';
  }

  const messageIndex = messages.findIndex((message) => {
    return message.name === field.type;
  });

  if (messageIndex > -1) {
    return 'message';
  }

  if (types[field.type]) {
    return types[field.type];
  }
  
  for (let i = 0; i < imports.length; i++) {
    const imported = imports[i];

    const messageIndex = imported.proto.messages.findIndex((message) => {
      return message.name === field.type;
    });

    const enumIndex = imported.proto.enums.findIndex((importEnum) => {
      return importEnum === field.type;
    });

    if (messageIndex > -1 || enumIndex > -1) {
      return 'import';
    }
  }

  throw new Error(`Unknown field type: ${field.type}`);
}

function isCustomType(field) {
  return types[field.type] === undefined;
}

module.exports = {
  capitalize: capitalize,
  determineType: determineType,
  isCustomType: isCustomType,
  snakeCaseToCamelCase: snakeCaseToCamelCase
}