module.exports = function handleEnum(enm, message) {
  var tsEnum = '';

  if (!message) {
    tsEnum += `export enum ${enm.name} {\n`;
  } else {
    tsEnum += `export enum ${message.name}${enm.name} {\n`;
  }

  for (var i = 0, len = enm.values.length; i < len; i++) {
    var value = enm.values[i];
    tsEnum += `  ${value.name} = ${value.id}`;

    if (i + 1 !== enm.values.length) {
      tsEnum += ',\n';
    } else {
      tsEnum += '\n';
    }
  }

  tsEnum += '}\n\n';

  return tsEnum;
}