require('express-async-errors');
const error = require('./middleware/error')
const dbDebug = require('debug')('app:db');
const mongoose = require('mongoose');
const config = require('config');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const users = require('./routes/users');
const funds = require('./routes/funds');
const stocks = require('./routes/stocks');
const express = require('express');
const app = express();

if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR: jwtPrivateKey is not defined.');
    process.exit(1);
}

if (!config.get('googleClientId')) {
    console.error('FATAL ERROR: googleClientKey is not defined.');
    process.exit(1);
}

mongoose.connect(config.get('db-host'))
    .then(() => dbDebug('Connected to MongoDB...'))
    .catch(err => dbDebug('Could not connect to MongoDB...'));

app.use(express.json());
app.use('/api/users', users);
app.use('/api/funds', funds);
app.use('/api/stocks', stocks);
app.use(error);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));