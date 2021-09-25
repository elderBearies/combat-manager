const utils = require('./utils');

const monsters = [{'name': 'test monster', 'type': 'dragon', 'armor_class': 21, 'hit_points': 333}];

// i opted to make the behavior of the endpoints identical
// params.limit defaults to 1 anyway if there's nothing passed in through the url
const getCustomMonsters = (request, response, params, acceptedTypes, httpMethod) => {
  // pull limit from params
  let { limit } = params;

  // verify number-ness of limit
  // set to 1 if NaN

  if (!Number.isNaN(Number(limit))) {
    limit = Math.floor(limit);
  } else {
    limit = 1;
  }

  // grab jokes as determined by limit
  const monSON = utils.getRandomArrItems(monsters, limit);

  // empty variables for storing data
  let monStr;
  let type = 'application/JSON';

  /**if (acceptedTypes.includes('text/xml')) {
    type = 'text/xml';
    //TODO
  } else {
    type = 'application/JSON';
    monStr = monSON.length > 1 ? JSON.stringify(monSON) : JSON.stringify(monSON[0]);
  } */

  monStr = JSON.stringify(monSON);
  utils.sendResponse(response, 200, type, monStr, httpMethod);
};

//pulled from body.parse example, modified to suit my needs
const addMonster = (request, response, body) => {
  const responseJSON = {
    message: 'please fill out all parameters!',
  };

  if (!body.name || !body.type || !body.armor_class || !body.hit_points) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON); // 400=bad request
  }

  let newMon = {};

  // we DID get a name and age
  let responseCode = 201; // "created"
  
  /**if (monsters[body.name]) { // user exists
    responseCode = 204; // updating, so "no content"
  } */ // gonna figure out making validation work shortly

  // update or initialize values, as the case may be
  newMon.name = body.name;
  newMon.type = body.type;
  newMon.armor_class = body.armor_class;
  newMon.hit_points = body.hit_points;
  
  monsters.push(newMon);

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON	);
  }

  return respondJSONMeta(request, response, responseCode); // this is for 204, a "no content" header
};

// borrowed from body.parse example - will refactor later
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// borrowed from body.parse example - will refactor later
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

module.exports.getCustomMonsters = getCustomMonsters;
module.exports.addMonster = addMonster;
