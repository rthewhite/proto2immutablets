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

    switch (type) {
      case 'string':
      case 'number':
      case 'boolean':
        methods += `  get ${field.name}(): ${type} {\n`;
        methods += `    return this._data.get('${field.name}');\n`;
        methods += `  }\n\n`

        methods += `  set${utils.capitalize(field.name)}(${field.name}: ${type}): ${message.name} {\n`;
        methods += `    const data = this._data.set('${field.name}', ${field.name});\n`;
        methods += `    return new ${message.name}(data.toJS());\n`;
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

        methods += `  get ${field.name}(): ${type}<${field.type}> {\n`;
        methods += `    return this._data.get('${field.name}');\n`;
        methods += `  }\n\n`;

        methods += `  set${utils.capitalize(field.name)}(${field.name}: ${type}<${field.type}>): ${message.name} {\n`;
        methods += `    const data = this._data.set('${field.name}', ${field.name});\n`
        methods += `    return new ${message.name}(data.toJS());\n`;
        methods += `  }\n\n`;
        break;

      case 'Map':
        methods += `  get ${field.name}(): ${type}<${field.keytype}, ${field.type}> {\n`;
        methods += `    return this._data.get('${field.name}');\n`;
        methods += `  }\n\n`;

        methods += `  set${utils.capitalize(field.name)}(${field.name}: ${type}<${field.keytype}, ${field.type}>): ${message.name} {\n`;
        methods += `    const data = this._data.set('${field.name}', ${field.name});\n`
        methods += `    return new ${message.name}(data.toJS());\n`;
        methods += `  }\n\n`;
        break;

      case 'custom':
        // Makes sure the custom type get's constructed
        constructor += `    if (this._data.get('${field.name}')) {\n`;
        constructor += `      this._data = this._data.set('${field.name}', new ${field.type}(this._data.get('${field.name}').toJS()));\n`
        constructor += `    }\n\n`;

        methods += `  get ${field.name} (): ${field.type} {\n`;
        methods += `    return this._data.get('${field.name}');\n`;
        methods += `  }\n\n`;

        methods += `  set${utils.capitalize(field.name)}(${field.name}: ${field.type}): ${message.name} {\n`;
        methods += `    const data = this._data.set('${field.name}', ${field.name});\n`;
        methods += `    return new ${message.name}(data.toJS());\n`;
        methods += `  }\n\n`;
        break;

      case 'message-enum':
      case 'global-enum':
        var enumType;

        if (type === 'message-enum') {
          enumType = `${message.name}${utils.capitalize(field.name)}`;
        } else {
          enumType = `${field.type}`;
        }

        // Make sure the enum get's constructed
        constructor += `    if (this._data.get('${field.name}') !== undefined) {\n`;
        constructor += `      this._data = this._data.set('${field.name}', ${enumType}[this._data.get('${field.name}')]);`;
        constructor += `    }\n\n`;

        methods += `  get ${field.name} (): ${enumType} {\n`;
        methods += `    return this._data.get('${field.name}');\n`;
        methods += `  }\n\n`;

        methods += `  set${utils.capitalize(field.name)}(${field.name}: ${enumType}): ${message.name} {\n`;
        methods += `    const data = this._data.set('${field.name}', ${field.name});\n`;
        methods += `    return new ${message.name}(data.toJS());\n`;
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
