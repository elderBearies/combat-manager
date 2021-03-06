import fs from 'fs';

// __dirname fix for modules courtesy of GOTO 0 on stackoverflow
// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-when-using-the-experimental-modules-flag
// modified a bit to make it work

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as utils from './utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// load all of the html pages
const errorPage = fs.readFileSync(`${__dirname}/../client/error.html`);
const defaultStyles = fs.readFileSync(`${__dirname}/../client/default-styles.css`);
const indexPage = fs.readFileSync(`${__dirname}/../client/client.html`);
const monsterPage = fs.readFileSync(`${__dirname}/../client/addMonster.html`);
const allLinks = fs.readFileSync(`${__dirname}/../client/allLinks.html`);
const adminPage = fs.readFileSync(`${__dirname}/../client/admin.html`);
const loader = `${__dirname}/../client/loading.gif`;
// loading gif from acegif.com

const get404Response = (request, response, httpMethod) => {
  utils.sendResponse(response, 404, 'text/html', errorPage, httpMethod);
};

const getCSSResponse = (request, response, httpMethod) => {
  utils.sendResponse(response, 200, 'text/css', defaultStyles, httpMethod);
};

const getIndexResponse = (request, response, httpMethod) => {
  utils.sendResponse(response, 200, 'text/html', indexPage, httpMethod);
};

const getMonsterPage = (request, response, httpMethod) => {
  utils.sendResponse(response, 200, 'text/html', monsterPage, httpMethod);
};

const getAllLinks = (request, response, httpMethod) => {
  utils.sendResponse(response, 200, 'text/html', allLinks, httpMethod);
};

const getAdminPage = (request, response, httpMethod) => {
  utils.sendResponse(response, 200, 'text/html', adminPage, httpMethod);
};

const getLoader = (request, response) => {
  utils.loadFile(request, response, loader, 'image/gif');
};

export {
  get404Response,
  getCSSResponse,
  getIndexResponse,
  getMonsterPage,
  getAllLinks,
  getAdminPage,
  getLoader,
};
