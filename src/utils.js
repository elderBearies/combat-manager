// pull in modules
import url, { fileURLToPath } from 'url';
import query from 'querystring';
import fs from 'fs';
import path, { dirname } from 'path';

// current directory
const __dirname = dirname(fileURLToPath(import.meta.url));

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
// added an if statement to catch invalid data
const getBinarySize = (string) => 
    if (!string) return 'Something went wrong.';
    return Buffer.byteLength(string, 'utf8');
}
// I got tired of writing this stuff out, so I made it a function.
const sendResponse = (response, code, type, data, httpMethod) => {
  const headers = {
    'Content-Type': type,
    'Content-Length': getBinarySize(data),
  };
  response.writeHead(code, httpMethod === 'HEAD' ? headers : { 'Content-Type': type });
  if (httpMethod !== 'HEAD') response.write(data);
  response.end();
};

// borrowed from streaming media assignment so i can stream the spinner gif
const loadFile = (request, response, filePath, tag) => {
  const file = path.resolve(__dirname, filePath);

  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    let { range } = request.headers;

    if (!range) {
      range = 'bytes=0-';
    }

    const positions = range.replace(/bytes=/, '').split('-'); // pull beginning and end positions from request range header

    let start = parseInt(positions[0], 10); // parse starting position to an int in base 10

    const total = stats.size; // get total file size in bytes

    // if no end position, set to end of file - else parse into an int in base 10
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    if (start > end) {
      start = end - 1; // if start > end, reset start range
    }

    const chunkSize = (end - start) + 1; // how big is our chunk?

    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`, // content range header - how much out of the full file is being sent
      'Accept-Ranges': 'bytes', // what type of data the browser should expect
      'Content-Length': chunkSize, // tell browser how big the chunk is
      'Content-Type': tag, // self explanatory
    });

    const stream = fs.createReadStream(file, { start, end }); // make a file stream

    stream.on('open', () => {
      stream.pipe(response); // pipe stream directly to client response
    });

    stream.on('error', (streamErr) => {
      // if error, end response and return the error. Browser will stop listening for bytes.
      response.end(streamErr);
    });

    return stream;
  });
};

// given accepted types and a json object, either parses json to xml or stringifies it.
const handleType = (acceptedTypes, json) => {
  let type;
  let str = '';

  if (acceptedTypes.includes('text/xml')) {
    type = 'text/xml';
    // if the json variable isn't an array, assume it's just one monster and parse accordingly
    if (!json.length) {
      str += `
        <monster>
          <name>${json.name}</name>
          <type>${json.type}</type>
          <ac>${json.armor_class}</ac>
          <hp>${json.hit_points}</hp>
        </monster>
      `;
    } else {
      for (let i = 0; i < json.length; i++) {
        str += `
          <monster>
            <name>${json[i].name}</name>
            <type>${json[i].type}</type>
            <ac>${json[i].armor_class}</ac>
            <hp>${json[i].hit_points}</hp>
          </monster>
        `;
      }
    }
  } else {
    type = 'application/JSON';
    str += JSON.stringify(json);
  }
  return { type, str };
};

export {
  getRandomArrItem,
  getRandomArrItems,
  parseURL,
  sendResponse,
  loadFile,
  handleType,
};
