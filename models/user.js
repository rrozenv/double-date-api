const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  apnToken: {
    type: String,
    required: false
  },
  isRegistered: Boolean,
  isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
  return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string(),
    phoneNumber: Joi.string(),
    googleToken: Joi.string(),
    apnToken: Joi.string()
  };

  return Joi.validate(user, schema);
}

function validateToken(token) {
  const schema = {
    token: Joi.string().required()
  };

  return Joi.validate(token, schema);
}

exports.User = User; 
exports.validateUser = validateUser;
exports.validateToken = validateToken;