const utils = require('./utils');

module.exports = function handleMessage(message, messages, globalEnums, imports) {
  const importedTypes = {};

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
    var type = utils.determineType(field, message, messages, messageEnums, globalEnums, imports);
    var fieldName = utils.snakeCaseToCamelCase(field.name);
    var messageName = utils.snakeCaseToCamelCase(message.name);

    // Split of potential packagename
    if (field.type.indexOf('.') > -1) {
      field.type = field.type.split('.')[1];
    }

    switch (type) {
      case 'string':
      case 'number':
      case 'boolean':
        methods += `  get ${fieldName}(): ${type} {\n`
        methods += `    return this._data.get('${fieldName}');\n`;
        methods += `  }\n\n`;

        methods += `  set${utils.capitalize(fieldName)}(${fieldName}: ${type}): ${messageName} {\n`;
        methods += `    return this.constructor(this._data.set('${fieldName}', ${fieldName}).toJS());\n`;
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
        methods += `    return this.constructor(this._data.set('${fieldName}', ${fieldName}).toJS());\n`;
        methods += `  }\n\n`;
        break;

      case 'Map':
        methods += `  get ${fieldName}(): ${type}<${field.keytype}, ${field.type}> {\n`;
        methods += `    return this._data.get('${fieldName}');\n`;
        methods += `  }\n\n`;

        methods += `  set${utils.capitalize(fieldName)}(${fieldName}: ${type}<${field.keytype}, ${field.type}>): ${messageName} {\n`;
        methods += `    return this.constructor(this._data.set('${fieldName}', ${fieldName}).toJS());\n`;
        methods += `  }\n\n`;
        break;

      case 'import':
      case 'message':

        // Resolve the imported type
        if (type === 'import') {
          for (let i = 0; i < imports.length; i++) {
            const imported = imports[i];

            const messageIndex = imported.proto.messages.findIndex((message) => {
              return message.name === field.type;
            });

            const enumIndex = imported.proto.enums.findIndex((importEnum) => {
              return importEnum === field.type;
            });

            if (messageIndex > -1 || enumIndex > -1) {
              if (!importedTypes[imported.import]) {
                importedTypes[imported.import] = [];
              }

              if (importedTypes[imported.import].indexOf(field.type) === -1) {
                importedTypes[imported.import].push(field.type);
              }
            }
          }
        }

        // Makes sure the custom type get's constructed
        constructor += `    if (this._data.get('${fieldName}')) {\n`;
        constructor += `      this._data = this._data.set('${fieldName}', new ${field.type}(this._data.get('${fieldName}').toJS()));\n`
        constructor += `    }\n\n`;

        methods += `  get ${fieldName} (): ${field.type} {\n`;
        methods += `    return this._data.get('${fieldName}');\n`;
        methods += `  }\n\n`;

        methods += `  set${utils.capitalize(fieldName)}(${fieldName}: ${field.type}): ${messageName} {\n`;
        methods += `    return new this.contructor(this._data.set('${fieldName}', ${fieldName}).toJS());\n`;
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

        methods += `  get ${fieldName} (): ${enumType} {\n`;
        methods += `    return this._data.get('${fieldName}');\n`;
        methods += `  }\n\n`;

        methods += `  set${utils.capitalize(fieldName)}(${fieldName}: ${enumType}): ${messageName} {\n`;
        methods += `    return this.constructor(this._data.set('${fieldName}', ${fieldName}).toJS());\n`;
        methods += `  }\n\n`;
        break;
    }
  });

  // Add to JS method
  methods += `  toJS() {\n`;
  methods += `    return this._data.toJS();\n`;
  methods += `  }\n`;

  TC = `
export class ${message.name} {
  private _data: Map<string, any>;
`;
  TC += constructor + '  }\n\n';
  TC += methods;
  TC += `}\n`;

  return {
    imports: importedTypes,
    class: TC
  }
}
