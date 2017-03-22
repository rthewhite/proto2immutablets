module.exports = function handleEnum(enm, message) {
  var tsEnum = '';

  if (!message) {
    tsEnum += `export enum ${enm.name} {\n`;
  } else {
    tsEnum += `export enum ${message.name}${enm.name} {\n`;
  }

  const keys = Object.keys(enm.values);

  for (var i = 0, len = keys.length; i < len; i++) {
    var value = enm.values[keys[i]];
    tsEnum += `  ${keys[i]} = ${value.value}`;

    if (i + 1 !== enm.values.length) {
      tsEnum += ',\n';
    } else {
      tsEnum += '\n';
    }
  }

  tsEnum += '}\n\n';

  return tsEnum;
}