const types = require('./types');
const utils = require('./utils');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function determineType(field, message, messageEnums, globalEnums) {
  // Check if it's a enum on message level
  if (messageEnums.indexOf(`${message.name}${capitalize(field.name)}`) > -1) {
    return 'message-enum';
  }

  // Check if it's a global enum
  if (globalEnums.indexOf(field.type) > -1) {
    return 'global-enum';
  }

  // Check if it's and standard type
  var tsType = types[field.type] || 'any';

  // Check the rules to see if it's an map or list
  switch(field.rule) {
    case 'repeated':
      tsType = 'List';
      break;

    case 'map':
      tsType = 'Map';
      break;
  }

  // Check for other entities
  // @TODO remove optional?
  if (field.rule === 'optional' && tsType === 'any') {
    tsType = 'custom';
  }

  return tsType;
}

function isCustomType(field) {
  return types[field.type] === undefined;
}

module.exports = {
  capitalize: capitalize,
  determineType: determineType,
  isCustomType: isCustomType
}