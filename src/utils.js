const types = require('./types');
const utils = require('./utils');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function determineType(field, message, messageEnums, globalEnums) {
  if (messageEnums.indexOf(`${message.name}${capitalize(field.name)}`) > -1) {
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

  return types[field.type] || 'custom';
}

function isCustomType(field) {
  return types[field.type] === undefined;
}

module.exports = {
  capitalize: capitalize,
  determineType: determineType,
  isCustomType: isCustomType
}