#!/usr/bin/env node
var fs = require('fs');
var program = require('commander');
var exec = require('child_process').exec;

var handleEnum = require('./enum');
var handleMessage = require('./message');

var generator = require('./generator');

program
  .version('0.0.1')
  .option('-p, --proto <item>', 'Proto file to convert')
  .option('-o, --output <item>', 'Output location')
  .parse(process.argv);

if (!program.proto) {
  throw new Error('No proto file passed');
}

generator.generate(program.proto, program.output);