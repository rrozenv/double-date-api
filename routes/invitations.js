const Fund = require('../models/fund').Fund; 
const Invitation = require('../models/invitation').Invitation; 
const Portfolio = require('../models/portfolio').Portfolio; 
const User = require('../models/user').User;
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user._id);

  const invitations = await Invitation
    .find({ recievedByPhoneNumber: user.phoneNumber, status: 'pending' })
    .populate('sentBy')

  const response = await Promise.all(invitations.map(async (invite) => { 
    const fund = await Fund.findById(invite.fund)
    return { 
        ...invite.toObject(),
        fundName: fund.name
    }
  }));

  res.send(response);
});

router.put('/:id/accept', auth, async (req, res) => {
    let invitation = await Invitation
        .findById(req.params.id)
        .populate('sentBy');
    invitation.status = 'accepted'
    
    let fund = await Fund.findById(invitation.fund);
    const portfolio = new Portfolio({ user: req.user, cashBalance: fund.maxCashBalance });
    fund.portfolios.push(portfolio);

    await Promise.all([invitation.save(), portfolio.save(), fund.save()])
    res.send({ 
        ...invitation.toObject(),
        fundName: fund.name
    });
});

module.exports = router;