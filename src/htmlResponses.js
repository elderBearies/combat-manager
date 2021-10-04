import fs from 'fs';

import { URL } from 'url'; // in Browser, the URL in native accessible on window
import * as utils from './utils.js';

// three lines below are courtesy of Rudolf Grohling on stackoverflow
// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-when-using-the-experimental-modules-flag
// modified a bit to make it work

const __filename = new URL('', import.meta.url).pathname;
// Will contain trailing slash
const dirname = new URL('.', import.meta.url).pathname;
const __dirname = dirname.slice(1);

const errorPage = fs.readFileSync(`${__dirname}/../client/error.html`);
const defaultStyles = fs.readFileSync(`${__dirname}/../client/default-styles.css`);
const indexPage = fs.readFileSync(`${__dirname}/../client/client.html`);
const monsterPage = fs.readFileSync(`${__dirname}/../client/addMonster.html`);
const allLinks = fs.readFileSync(`${__dirname}/../client/allLinks.html`);

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

export {
  get404Response,
  getCSSResponse,
  getIndexResponse,
  getMonsterPage,
  getAllLinks,
};
