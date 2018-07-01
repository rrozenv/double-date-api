const Joi = require('joi');
const mongoose = require('mongoose');

const Portfolio = mongoose.model('Portfolio', new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}));

exports.Portfolio = Portfolio; 