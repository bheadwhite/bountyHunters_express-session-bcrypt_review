const express = require('express');
const app = express();
const session = require('express-session');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { accessGrantedList } = require('./accessCodes');
require('dotenv').config();

const getSwapiUrl = (num) => `https://swapi.dev/api/people/${num}/`;

app.use(
  express.json(),
  session({
    resave: false,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: {
      maxAge: 9999999999,
    },
  }),
);

const SERVER_PORT = 3001;

function isAccessCodeLegit(req, res, next) {
  if (req.session.isLegit) {
    next();
  } else {
    res.status(403).send('you are not authorized, ....hunter... (sus)');
  }
}

app.post('/api/auth', (req, res) => {
  const { accessCode } = req.body;
  if (!accessCode) {
    res.status(403).send('access code required');
    return;
  }

  let isAuthorized = false;

  accessGrantedList.forEach((hash) => {
    if (bcrypt.compareSync(accessCode, hash)) {
      bcrypt.hashSync;
      isAuthorized = true;
    }
  });

  if (isAuthorized) {
    req.session.isLegit = true;
  }

  res.status(200).send('ok');
});

app.get('/api/nextBounty', isAccessCodeLegit, async (req, res) => {
  const randomNumber = Math.ceil(Math.random() * 50);
  const bountyMultiplier = 200000;
  const { data } = await axios.get(getSwapiUrl(randomNumber));

  const {
    name,
    height,
    mass,
    hair_color,
    skin_color,
    eye_color,
    birth_year,
    gender,
    homeworld: homeworldURL,
  } = data;

  const homeworldName = await axios.get(homeworldURL).then((response) => {
    return response.data.name;
  });

  res.status(200).send({
    message: 'Hello hunter, here is your next target.',
    bounty: {
      name,
      height,
      mass,
      hair_color,
      skin_color,
      eye_color,
      birth_year,
      gender,
      homeworldName,
      reward: bountyMultiplier * data.films.length + ' credits',
    },
  });
});

app.listen(SERVER_PORT, () =>
  console.log(`server is running on ${SERVER_PORT}`),
);
