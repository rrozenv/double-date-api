const {Fund, validate} = require('../models/fund'); 
const Portfolio = require('../models/portfolio').Portfolio; 
const Invitation = require('../models/invitation').Invitation; 
const fetchStocks = require('../iex_api/iex_stocks').fetchStocks; 
const fetchCurrentPricesFor = require('../iex_api/iex_stocks').fetchCurrentPricesFor; 
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  
  const funds = await Fund.find()
    .populate('admin')
    .populate({
        path: 'portfolios',
        model: 'Portfolio'
    });

  const newFunds = await Promise.all(funds.map(async (fund) => {
      
    const userPort = fund.portfolios.filter((port) => { 
      return `${port.user}` === `${req.user._id}` 
    })

    const populatedUserPort = await Portfolio
      .findById(userPort[0]._id)
      .populate('user')
      .populate([
        {
          path: 'user',
          model: 'User'
        },
        {
          path: 'positions',
          model: 'Position'
        }
      ]);
    
    if (populatedUserPort.positions.length !== 0) {
      const updatedPositions = await fetchCurrentPricesFor(populatedUserPort.positions);
      populatedUserPort.positions = updatedPositions
    }

    return { 
      _id: fund._id,
      admin: fund.admin,
      name: fund.name,
      maxPlayers: fund.maxPlayers,
      portfolios: fund.portfolios.map((fund) => fund._id),
      currentUserPortfolio: populatedUserPort
    }

  }));

  console.log(newFunds);

  res.send(newFunds);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  
  const { name, maxPlayers, maxCashBalance, invitedPhoneNumbers } = req.body
  
  const portfolio = new Portfolio({ user: req.user, cashBalance: maxCashBalance });
  const fund = new Fund({ 
    admin: req.user,
    name: name,
    maxPlayers: maxPlayers,
    maxCashBalance: maxCashBalance,
    portfolios: [portfolio]
  });

  await Promise.all([portfolio.save(), fund.save()])

  const invitations = invitedPhoneNumbers.map(async (number) => { 
    //const invitedUser = await User.find({ phoneNumber: number });
    const invitation = new Invitation({ 
      sentBy: req.user, 
      fund: fund, 
      recievedByPhoneNumber: number,
      status: 'pending' 
    })
    await invitation.save()
    return invitation
  });

  const newFund = await Fund
        .findById(fund._id)
        .populate('admin')

  const portfolioId = newFund.portfolios[0]._id
  const userPortfolio = await Portfolio
    .findById(portfolioId)
    .populate('user');

  const updatedFund = { 
    _id: newFund._id,
    admin: newFund.admin,
    name: newFund.name,
    maxPlayers: newFund.maxPlayers,
    portfolios: newFund.portfolios,
    currentUserPortfolio: userPortfolio
  };

  console.log(updatedFund);
  
  res.send(updatedFund);
});

module.exports = router;

        // .populate({
        //   path: 'currentUserPortfolio',
        //   model: 'Portfolio',
        //   populate: {
        //     path: 'user',
        //     model: 'User'
        //   }
        // });