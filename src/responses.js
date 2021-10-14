import fetch from 'node-fetch'; // it wouldn't let me require() it so everything's modules now
import * as utils from './utils.js';

// internal api array
const monsters = [{
  index: 'test-monster', name: 'test monster', type: 'dragon', armor_class: 21, hit_points: 333,
},
{
  index: 'big-sword-guy', name: 'Big Sword Guy', type: 'humanoid', armor_class: 18, hit_points: 120,
}];

// function to grab monsters from the external api as necessary
const getMonsters = async (str = '') => {
  const apiResp = await fetch(`https://www.dnd5eapi.co/api/monsters/${str}`);
  const monJSON = await apiResp.json();
  if (monJSON.results) return monJSON.results;
  return monJSON;
};

// borrowed from body.parse example
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// borrowed from body.parse example
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// fills an array with all of the monsters from both the internal and external apis
const allMonsters = async (request, response, params, acceptedTypes, httpMethod) => {
  const externalMons = await getMonsters();
  const monSON = [].concat(monsters);

  // i couldn't get this to work without the await inside of the loop
  // changed eslint settings so it would stop yelling at me
  for (let i = 0; i < externalMons.length; i++) {
    monSON.push(await getMonsters(externalMons[i].index));
  }

  const data = utils.handleType(acceptedTypes, monSON);

  utils.sendResponse(response, 200, data.type, data.str, httpMethod);
};

// searches both apis for a monster matching the term parameter
const searchMons = async (request, response, params, acceptedTypes, httpMethod) => {
  const externalMons = await getMonsters();
  const { term } = params;
  const failedToFind = {
    code: 404,
    msg: "Couldn't find that monster!",
  };
  let data;

  // if there isn't a term, immediately respond with 404
  if (!term || term.length <= 0) {
    utils.sendResponse(response, 404, 'application/JSON', JSON.stringify(failedToFind), httpMethod);
    return;
  }
  let foundMon = '';
  // search external api first
  for (let i = 0; i < externalMons.length; i += 1) {
    if (externalMons[i].index.includes(term)) {
      foundMon = externalMons[i].index;
      break;
    }
  }
  // if monster is found in external api, query it up and respond with 200
  if (foundMon.length > 0) {
    data = utils.handleType(acceptedTypes, await getMonsters(foundMon));
    utils.sendResponse(response, 200, data.type, data.str, httpMethod);
    return;
  }

  // search internal api and return monster with 200 if it's in there
  for (let i = 0; i < monsters.length; i += 1) {
    if (monsters[i].index.includes(term)) {
      data = utils.handleType(acceptedTypes, monsters[i]);
      utils.sendResponse(response, 200, data.type, data.str, httpMethod);
      return;
    }
  }
  // if none of the above works, respond with 404
  utils.sendResponse(response, 404, 'application/JSON', JSON.stringify(failedToFind), httpMethod);
};

// grabs a given amount of random monsters from the internal api
// params.limit defaults to 1 if there's nothing passed in through the url
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

  const data = utils.handleType(acceptedTypes, monSON);

  utils.sendResponse(response, 200, data.type, data.str, httpMethod);
};

// pulled from body.parse example, modified to suit my needs
// adds a monster to the internal api
const addMonster = async (request, response, body) => {
  const responseJSON = {
    message: 'Please fill out all parameters properly!',
  };

  let responseCode = 201;

  const externalMons = await getMonsters();

  // make sure all the necessary data is present
  if (!body.name || !body.type || !body.armor_class || !body.hit_points) {
    responseJSON.id = 'missingParams';
    responseCode = 400; // bad request
    return respondJSON(request, response, responseCode, responseJSON);
  }

  const ac = Number.parseInt(body.armor_class, 10);
  const hp = Number.parseInt(body.hit_points, 10);
  const nameString = body.name;
  const monIndex = nameString.replace(/ /g, '-').toLowerCase();

  // if the number fields don't parse out correctly, it's the user's fault
  if (Number.isNaN(ac) || Number.isNaN(hp)) {
    responseJSON.id = 'missingParams';
    responseCode = 400; // bad request
    return respondJSON(request, response, responseCode, responseJSON);
  }

  // check the external api for duplicates, respond with 409 if there are any
  for (let i = 0; i < externalMons.length; i += 1) {
    if (externalMons[i].index === monIndex) {
      responseCode = 409; // conflict
      responseJSON.id = 'existsExternally';
      responseJSON.message = 'Try a different name!';
      return respondJSON(request, response, responseCode, responseJSON);
    }
  }

  // check internal api for duplicates - if there are any, remove them and set response code to 204
  for (let i = 0; i < monsters.length; i += 1) {
    if (monsters[i].index === monIndex) {
      responseCode = 204; // updating
      monsters.splice(i);
      break;
    }
  }

  // make new monster
  const newMon = {
    index: monIndex,
    name: nameString,
    type: body.type,
    armor_class: ac,
    hit_points: hp,
  };

  // add to internal api
  monsters.push(newMon);

  // if it's a new monster respond with 201, otherwise respond with 204
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode); // this is for 204, a "no content" header
};

export {
  getCustomMonsters,
  addMonster,
  searchMons,
  allMonsters,
};
