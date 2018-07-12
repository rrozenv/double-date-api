const Joi = require('joi');
const mongoose = require('mongoose');

const Portfolio = mongoose.model('Portfolio', new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cashBalance: { 
    type: Number, 
    required: true,
    min: 0
  },
  positions: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position'
  }]
}));

function validatePortfolio(portfolio) {
  const schema = {
    cashBalance: Joi.number().min(0).required()
  };

  return Joi.validate(portfolio, schema);
}

exports.Portfolio = Portfolio; 
exports.validate = validatePortfolio;