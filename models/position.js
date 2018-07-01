const Joi = require('joi');
const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  ticker: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  buyPrice: { 
    type: Number, 
    required: true,
    min: 0
  },
  currentPrice: { 
    type: Number, 
    min: 0
  },
  sellPrice: { 
    type: Number, 
    min: 0
  },
  shares: { 
    type: Number, 
    required: true,
    min: 0
  },
  fundIds: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fund'
  }]
});

const Position = mongoose.model('Position', positionSchema);

function validatePosition(position) {
  const schema = {
    type: Joi.string().min(5).max(50).required(),
    ticker: Joi.string().min(5).max(50).required(),
    buyPrice: Joi.number().min(0).required(),
    currentPrice: Joi.number().min(0).required(),
    shares: Joi.number().min(0).required(),
    fundIds: Joi.array().items(Joi.string()).required()
  };

  return Joi.validate(position, schema);
}

exports.Position = Position; 
exports.validate = validatePosition;