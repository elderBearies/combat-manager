const utils = require('./utils');

const jokes = [{ q: 'What do you call a very small valentine?', a: 'A valen-tiny!' }, { q: 'What did the dog say when he rubbed his tail on the sandpaper?', a: 'Ruff, Ruff!' }, { q: "Why don't sharks like to eat clowns?", a: 'Because they taste funny!' }, { q: 'What did the fish say when be bumped his head?', a: 'Dam!' }, { q: 'Why did the drunk walk into the bar?', a: "He couldn't see it coming!" }, { q: "What's worse than a stick in the eye?", a: 'A stick in each eye.' }, { q: 'I keep trying to lose weight.', a: 'It keeps finding me.' }, { q: "I know a guy who's really good at Russian Roulette...", a: "He's only lost once!" }, { q: 'What do you get a man with no elbows?', a: 'Elbows.' }, { q: "What is a duck's favorite drug?", a: 'Quack cocaine!' }, { q: "What do you call a boomerang that doesn't come back?", a: 'A stick.' }, { q: "I don't usually like cooking with fresh herbs...", a: "But this thyme... It's different." }, { q: 'Do you wanna hear a knock-knock joke?', a: 'Two guys walk into a bar.' }, { q: 'I tried to kill a spider with soap?', a: 'He got away clean.' }, { q: 'What do you call a time traveling bounty hunter?', a: 'A ManDelorean!' }, { q: "What's red and bad for your teeth?", a: 'A brick.' }, { q: 'What do you call a belt made of watches?', a: 'A waist of time!' }, { q: "What's the best way to carve wood?", a: 'Whittle by whittle!' }, { q: 'Why was 6 afraid of 7?', a: 'Because 7 was a registered 6 offender!' }]; // oh boy raw pasted json! can't wait to learn how to use a proper database because this is fucking disgusting.

// i opted to make the behavior of the endpoints identical
// params.limit defaults to 1 anyway if there's nothing passed in through the url
const getRandomJokeResponse = (request, response, params, acceptedTypes, httpMethod) => {
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
  const jokeSON = utils.getRandomArrItems(jokes, limit);

  // empty variables for storing data
  let jokeStr;
  let type;

  if (acceptedTypes.includes('text/xml')) {
    type = 'text/xml';
    if (jokeSON.length > 1) {
      jokeStr = '<jokes>';
      for (let i = 0; i < jokeSON.length; i += 1) {
        jokeStr += `
        <joke>
          <q>${jokeSON[i].q}</q>
          <a>${jokeSON[i].a}</a>
        </joke>`;
      }
      jokeStr += '</jokes>';
    } else {
      jokeStr = `
        <joke>
          <q>${jokeSON[0].q}</q>
          <a>${jokeSON[0].a}</a>
        </joke>`;
    }
  } else {
    type = 'application/JSON';
    jokeStr = jokeSON.length > 1 ? JSON.stringify(jokeSON) : JSON.stringify(jokeSON[0]);
  }

  utils.sendResponse(response, 200, type, jokeStr, httpMethod);
};

module.exports.getRandomJokeResponse = getRandomJokeResponse;
