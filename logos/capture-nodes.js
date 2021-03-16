#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const centres = require('./logos-to-capture.json');
const LOGO_CHECK_TAG = /<img [^>]* id\s*=\s*"logo_entity"[^>]*>/;
const IMG_GET_URL = /src\s*=\s*"([^"]+)"/
// const LOGO_TAG = /<img id\s*=\s*"logo_entity" src\s*=\s*"(.+)"\s*>/;
const GENERIC_LOGO = /\/2014\/09\/logo-(escola|centre1)\.png$/;
const RAW_LOGOS = path.join(__dirname, 'raw');

const fetchCentre = (id, url) => {
  return fetch(url)
    .then(response => response.text())
    .then(html => {
      const tagMatch = html.match(LOGO_CHECK_TAG);
      if (tagMatch && tagMatch.length > 0) {
        const urlMatch = tagMatch[0].match(IMG_GET_URL);
        if (urlMatch && urlMatch.length > 1)
          return urlMatch[1];
      }
      console.log(chalk.yellow('WARNING: ') + `El centre ${id} (${url}) no té cap logo a la portada`);
      return null;
    })
}

const downloadLogo = (id, url, dest) => {
  const urlLower = url.toLowerCase();
  let ext = urlLower.substr(urlLower.lastIndexOf('.') + 1);
  if (ext === 'jpeg')
    ext = 'jpg';
  const destFile = path.join(dest, `${id}.${ext}`);
  if (fs.existsSync(destFile)) {
    console.log(chalk.green('INFO: ') + `El fitxer ${destFile} ja existeix! Passem al següent.`);
    return false;
  }

  console.log(chalk.green('INFO: ') + `S'està descarregant: ${url}`);
  return fetch(encodeURI(url))
    .then(res => {
      const stream = fs.createWriteStream(destFile);
      res.body.pipe(stream);
      stream.on('error', err => console.log(chalk.red('ERROR: ') + err.toString()));
      stream.on('close', () => console.log(chalk.green('INFO: ') + `File ${destFile} ready`));
    });
}

try {

  // Create output directory if not exists
  if (!fs.existsSync(RAW_LOGOS))
    fs.mkdirSync(RAW_LOGOS);

  Promise.all(
    centres.map(centre => {

      return fetchCentre(centre.id, centre.url)
        .then(logoUrl => {

          if (!logoUrl)
            return true;
          else if (GENERIC_LOGO.test(logoUrl)) {
            console.log(chalk.yellow('WARNING: ') + `El centre ${centre.id} (${centre.url}) encara té el logo genèric!`);
            return true;
          }
          return downloadLogo(centre.id, logoUrl, RAW_LOGOS);
        })
    }))
    .catch(err => console.log(chalk.red('ERROR: ') + err.toString()));
} catch (err) {
  console.log(chalk.red('ERROR: ') + err.toString());
}
