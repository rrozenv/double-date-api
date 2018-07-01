const config = require('config');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(config.get('googleClientId'));
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const {User, validate} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  console.log(user);
  res.send(user);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  console.log("wtf")
  const { name, email, googleToken } = req.body

  const ticket = await client.verifyIdToken({
    idToken: googleToken,
    audience: config.get('googleClientId')
  });
  
  console.log(ticket);
  let user = await User.findOne({ email: email });

  if (!user) { 
    user = new User({ name: name, email: email });
    await user.save();
  } 
  console.log(user);
  const token = user.generateAuthToken();
  console.log(token);
  return res.header('x-auth-token', token).send(user);
});

module.exports = router; 