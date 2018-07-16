const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  sentBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fund: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fund'
  },
  recievedBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  recievedByPhoneNumber: { 
    type: String, 
    required: true,
    min: 0
  },
  status: { 
    type: String, 
    required: true,
    min: 0
  }
});

const Invitation = mongoose.model('Invitation', invitationSchema);

exports.Invitation = Invitation; 