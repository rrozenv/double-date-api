const Joi = require('joi');
const mongoose = require('mongoose');

const Fund = mongoose.model('Fund', new mongoose.Schema({
  admin: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true, 
    minlength: 5,
    maxlength: 255
  },
  maxPlayers: { 
    type: Number, 
    required: true,
    min: 0,
    max: 255
  },
  portfolios: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio'
  }]
}));

function validateFund(fund) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    maxPlayers: Joi.number().min(1).required(),
    maxCashBalance: Joi.number().min(1).required(),
  };

  return Joi.validate(fund, schema);
}

exports.Fund = Fund; 
exports.validate = validateFund;