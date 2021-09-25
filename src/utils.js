// pull in URL module
const url = require('url');

// pull in query module
const query = require('querystring');

// pull in http module
const http = require('http');

// given an array, grabs a random element.
const getRandomArrItem = (arr) => {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
};

// given an array and a number, grabs a shuffled selection of the given array
const getRandomArrItems = (arr, num = 1) => {
  const randomArr = [];
  for (let i = 0; i < num && i < arr.length; i += 1) {
    const newItem = getRandomArrItem(arr);
    if (randomArr.includes(newItem)) {
      i -= 1;
    } else {
      randomArr.push(newItem);
    }
  }
  return randomArr;
};

// given a request, parses out the url pathname and parameters
const parseURL = (urlStr) => {
  const parsedUrl = url.parse(urlStr);
  const { pathname } = parsedUrl;
  const params = query.parse(parsedUrl.query);
  return { params, pathname };
};

// source: https://stackoverflow.com/questions/2219526/how-many-bytes-in-a-javascript-string/29955838
// refactored to arrow function by ACJ
const getBinarySize = (string) => Buffer.byteLength(string, 'utf8');

const sendResponse = (response, code, type, data, httpMethod) => {
  const headers = {
    'Content-Type': type,
    'Content-Length': getBinarySize(data),
  };
  response.writeHead(code, httpMethod === 'HEAD' ? headers : { 'Content-Type': type });
  if (httpMethod !== 'HEAD') response.write(data);
  response.end();
};

module.exports.getRandomArrItem = getRandomArrItem;
module.exports.getRandomArrItems = getRandomArrItems;
module.exports.parseURL = parseURL;
module.exports.sendResponse = sendResponse;
