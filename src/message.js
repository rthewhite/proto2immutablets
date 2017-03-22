const utils = require('./utils');

module.exports = function handleMessage(message, globalEnums) {
  var TC = `
export class ${message.name} {
  private _data: Map<string, any>;
`;

  var constructor = `
  constructor(data: any = {}) {
    this._data = fromJS(data);\n\n`

  var methods = ``

  // Find enums for message
  const messageEnums = [];
  if (message.enums ) {
    message.enums.forEach(enm => {
      messageEnums.push(`${message.name}${enm.name}`);
    });
  }

  message.fields.forEach(field => {
    var type = utils.determineType(field, message, messageEnums, globalEnums);
    var fieldName = utils.snakeCaseToCamelCase(field.name);
    var messageName = utils.snakeCaseToCamelCase(message.name);


    console.log(type);
    switch (type) {
      case 'string':
      case 'number':
      case 'boolean':
        methods += `  get ${fieldName}(): ${type} {\n`;
        methods += `    return this._data.get('${fieldName}');\n`;
        methods += `  }\n\n`

        methods += `  set${utils.capitalize(fieldName)}(${fieldName}: ${type}): ${messageName} {\n`;
        methods += `    const data = this._data.set('${fieldName}', ${fieldName});\n`;
        methods += `    return new ${messageName}(data.toJS());\n`;
        methods += `  }\n\n`;
        break;

      case "List":
        // Make sure the items in the list are of the correct type when constructing
        if (utils.isCustomType(field)) {
          constructor += `    if (this._data.get('${field.name}')) {\n`
          constructor += `      const ${field.name} = [];\n`;
          constructor += `      this._data.get('${field.name}').map(item => {\n`;
          constructor += `        ${field.name}.push( new ${field.type}(item.toJS()));\n`;
          constructor += `      });\n`;
          constructor += `      this._data = this._data.set('${field.name}', List(${field.name}));\n`;
          constructor += `    }\n\n`
        }

        methods += `  get ${fieldName}(): ${type}<${field.type}> {\n`;
        methods += `    return this._data.get('${fieldName}');\n`;
        methods += `  }\n\n`;

        methods += `  set${utils.capitalize(fieldName)}(${fieldName}: ${type}<${field.type}>): ${messageName} {\n`;
        methods += `    const data = this._data.set('${fieldName}', ${fieldName});\n`
        methods += `    return new ${messageName}(data.toJS());\n`;
        methods += `  }\n\n`;
        break;

      case 'Map':
        methods += `  get ${fieldName}(): ${type}<${field.keytype}, ${field.type}> {\n`;
        methods += `    return this._data.get('${fieldName}');\n`;
        methods += `  }\n\n`;

        methods += `  set${utils.capitalize(fieldName)}(${fieldName}: ${type}<${field.keytype}, ${field.type}>): ${messageName} {\n`;
        methods += `    const data = this._data.set('${fieldName}', ${fieldName});\n`
        methods += `    return new ${messageName}(data.toJS());\n`;
        methods += `  }\n\n`;
        break;

      case 'custom':
        // Makes sure the custom type get's constructed
        constructor += `    if (this._data.get('${fieldName}')) {\n`;
        constructor += `      this._data = this._data.set('${fieldName}', new ${field.type}(this._data.get('${fieldName}').toJS()));\n`
        constructor += `    }\n\n`;

        methods += `  get ${fieldName} (): ${field.type} {\n`;
        methods += `    return this._data.get('${fieldName}');\n`;
        methods += `  }\n\n`;

        methods += `  set${utils.capitalize(fieldName)}(${fieldName}: ${field.type}): ${messageName} {\n`;
        methods += `    const data = this._data.set('${fieldName}', ${fieldName});\n`;
        methods += `    return new ${messageName}(data.toJS());\n`;
        methods += `  }\n\n`;
        break;

      case 'message-enum':
      case 'global-enum':
        var enumType;

        if (type === 'message-enum') {
          enumType = `${messageName}${utils.capitalize(fieldName)}`;
        } else {
          enumType = `${field.type}`;
        }

        // Make sure the enum get's constructed
        constructor += `    if (this._data.get('${fieldName}') !== undefined) {\n`;
        constructor += `      this._data = this._data.set('${fieldName}', ${enumType}[this._data.get('${fieldName}')]);`;
        constructor += `    }\n\n`;

        methods += `  get ${fieldName} (): ${enumType} {\n`;
        methods += `    return this._data.get('${fieldName}');\n`;
        methods += `  }\n\n`;

        methods += `  set${utils.capitalize(fieldName)}(${fieldName}: ${enumType}): ${messageName} {\n`;
        methods += `    const data = this._data.set('${fieldName}', ${fieldName});\n`;
        methods += `    return new ${messageName}(data.toJS());\n`;
        methods += `  }\n\n`;
        break;

    }
  });

  // Add to JS method
  methods += `  toJS() {\n`;
  methods += `    return this._data.toJS();\n`;
  methods += `  }\n`;

  TC += constructor + '  }\n\n';
  TC += methods;
  TC += `}\n`;

  return TC;
}
