const fs = require('fs'); // grab file system module

const utils = require('./utils'); // grab utility functions

const errorPage = fs.readFileSync(`${__dirname}/../client/error.html`);
const defaultStyles = fs.readFileSync(`${__dirname}/../client/default-styles.css`);
const indexPage = fs.readFileSync(`${__dirname}/../client/client.html`);

const get404Response = (request, response, httpMethod) => {
  utils.sendResponse(response, 404, 'text/html', errorPage, httpMethod);
};

const getCSSResponse = (request, response, httpMethod) => {
  utils.sendResponse(response, 200, 'text/css', defaultStyles, httpMethod);
};

const getIndexResponse = (request, response, httpMethod) => {
  utils.sendResponse(response, 200, 'text/html', indexPage, httpMethod);
};

module.exports.get404Response = get404Response;
module.exports.getCSSResponse = getCSSResponse;
module.exports.getIndexResponse = getIndexResponse;
