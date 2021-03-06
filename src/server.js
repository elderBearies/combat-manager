// pull in the HTTP server module
import http from 'http';

// pull in utility functions
import query from 'querystring';
import * as utils from './utils.js';

// pull in query module
// pull in external modules
import * as htmlHandler from './htmlResponses.js';
import * as jsonHandler from './responses.js';

// locally this will be 3000, on Heroku it will be assigned
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// make a call table
const urlStruct = {
  '/': htmlHandler.getIndexResponse,
  '/customMonsters': jsonHandler.getCustomMonsters,
  '/searchMonsters': jsonHandler.searchMons,
  '/addMonster': htmlHandler.getMonsterPage,
  '/links': htmlHandler.getAllLinks,
  '/default-styles.css': htmlHandler.getCSSResponse,
  '/admin': htmlHandler.getAdminPage,
  '/viewAll': jsonHandler.allMonsters,
  '/loading.gif': htmlHandler.getLoader,
  notFound: htmlHandler.get404Response,
};

// pulled from body.parse example
// passes POST data received over to addMonster in the json response handler
const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addMonster') {
    const body = [];

    // https://nodejs.org/api/http.html
    request.on('error', (err) => {
      // console.dir(error);
      response.statusCode = 400;
      response.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);

      jsonHandler.addMonster(request, response, bodyParams);
    });
  }
};

// this is the function that is called every time a client request comes in
const onRequest = (request, response) => {
  // grab params from url
  const urlData = utils.parseURL(request.url);

  let acceptedTypes = request.headers.accept && request.headers.accept.split(',');
  acceptedTypes = acceptedTypes || [];

  const httpMethod = request.method;
  if (request.method === 'POST') {
    handlePost(request, response, urlData);
  } else if (urlStruct[urlData.pathname]) {
    urlStruct[urlData.pathname](request, response, urlData.params, acceptedTypes, httpMethod);
  } else {
    urlStruct.notFound(request, response, httpMethod);
  }
};

// create the server, hook up the request handling function, and start listening on `port`
http.createServer(onRequest).listen(port); // method chaining!
