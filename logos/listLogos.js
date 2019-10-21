#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SIMPLE = process.argv.length > 2 && process.argv[2] == 'simple';

const BASE = path.join(__dirname, '150h');
//const logos = require('./logos.json');
const logos = fs.readdirSync(BASE).map(f => f.substr(0, f.lastIndexOf('.')));
const logoData = [];

logos.forEach(logo => {
  const fileName = `${logo}.png`;
  const fd = fs.openSync(path.join(BASE, fileName));
  const fstat = fs.fstatSync(fd);
  logoData.push(SIMPLE ?
    logo :
    {
      id: logo,
      file: fileName,
      date: fstat.mtime.toISOString(),
      size: fstat.size,
    });
  fs.closeSync(fd);
});

console.log(JSON.stringify(logoData, 2));
