import fetch from 'node-fetch'; // it wouldn't let me require() it so everything's modules now
import * as utils from './utils.js';

const monsters = [{
  index: 'test-monster', name: 'test monster', type: 'dragon', armor_class: 21, hit_points: 333,
}];

const getMonsters = async (str = '') => {
  const apiResp = await fetch(`https://www.dnd5eapi.co/api/monsters/${str}`);
  const monJSON = await apiResp.json();
  if (monJSON.results) return monJSON.results;
  return monJSON;
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

const searchMons = async (response, str, httpMethod) => {
  const externalMons = await getMonsters();
  const failedToFind = {
    code: 404,
    msg: "Couldn't find that monster!",
  };
  if (str.length <= 0) utils.sendResponse(response, 404, 'application/JSON', JSON.stringify(failedToFind), httpMethod);
  let monStr;
  let foundMon = '';
  for (let i = 0; i < externalMons.length; i += 1) {
    if (externalMons[i].index.includes(str)) {
      foundMon = externalMons[i].index;
      break;
    }
  }
  if (foundMon.length > 0) {
    monStr = JSON.stringify(await getMonsters(foundMon));
    utils.sendResponse(response, 200, 'application/JSON', monStr, httpMethod);
    return;
  }

  for (let i = 0; i < monsters.length; i += 1) {
    if (monsters[i].index.includes(str)) {
      monStr = JSON.stringify(monsters[i]);
      utils.sendResponse(response, 200, 'application/JSON', monStr, httpMethod);
      return;
    }
  }
  utils.sendResponse(response, 404, 'application/JSON', JSON.stringify(failedToFind), httpMethod);
};

// params.limit defaults to 1 if there's nothing passed in through the url
const getCustomMonsters = (request, response, params, acceptedTypes, httpMethod) => {
  const { search } = params;
  console.log(search);

  if (search) {
    console.log('searching...');
    searchMons(response, search, httpMethod);
    return;
  }

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
  // let monStr;
  const type = 'application/JSON';

  /** if (acceptedTypes.includes('text/xml')) {
    type = 'text/xml';
    //TODO
  } else {
    type = 'application/JSON';
    monStr = monSON.length > 1 ? JSON.stringify(monSON) : JSON.stringify(monSON[0]);
  } */

  // defined as const for now bc eslint was yelling at me
  const monStr = JSON.stringify(monSON);
  utils.sendResponse(response, 200, type, monStr, httpMethod);
};

// pulled from body.parse example, modified to suit my needs
const addMonster = async (request, response, body) => {
  const responseJSON = {
    message: 'Please fill out all parameters properly!',
  };

  let responseCode = 201;

  const externalMons = await getMonsters();

  if (!body.name || !body.type || !body.armor_class || !body.hit_points) {
    responseJSON.id = 'missingParams';
    responseCode = 400; // bad request
    return respondJSON(request, response, responseCode, responseJSON);
  }

  const ac = Number.parseInt(body.armor_class, 10);
  const hp = Number.parseInt(body.hit_points, 10);
  const nameString = body.name;
  const monIndex = nameString.replace(/ /g, '-').toLowerCase();

  if (Number.isNaN(ac) || Number.isNaN(hp)) {
    responseJSON.id = 'missingParams';
    responseCode = 400; // bad request
    return respondJSON(request, response, responseCode, responseJSON);
  }

  for (let i = 0; i < externalMons.length; i += 1) {
    if (externalMons[i].index === monIndex) {
      responseCode = 409; // conflict
      responseJSON.id = 'existsExternally';
      responseJSON.message = 'Try a different name!';
      return respondJSON(request, response, responseCode, responseJSON);
    }
  }

  for (let i = 0; i < monsters.length; i += 1) {
    if (monsters[i].index === monIndex) {
      responseCode = 204; // updating
      monsters.splice(i);
      break;
    }
  }

  const newMon = {
    index: monIndex,
    name: nameString,
    type: body.type,
    armor_class: ac,
    hit_points: hp,
  };

  monsters.push(newMon);

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode); // this is for 204, a "no content" header
};

export {
  getCustomMonsters,
  addMonster,
};
