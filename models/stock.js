const mongoose = require('mongoose');

const Stock = mongoose.model('Stock', new mongoose.Schema({
  symbol: { 
    type: String,
    required: true,
    minlength: 0,
    maxlength: 50
  },
  companyName: { 
    type: String,
    required: false,
    minlength: 0,
    maxlength: 250
  }
}));

exports.Stock = Stock; 