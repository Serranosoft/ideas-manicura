const fs = require('node:fs');
const path = require('node:path');

const source = path.resolve(__dirname, '../../src/domain/affiliate/catalog-schema.js');
const destination = path.resolve(__dirname, '../schema/mobile-validator.cjs');
fs.copyFileSync(source, destination);
console.log('Mobile catalog validator synchronized.');
