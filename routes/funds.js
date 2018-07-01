const {Fund, validate} = require('../models/fund'); 
const Portfolio = require('../models/portfolio').Portfolio; 
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
      
    const userPortfolio = fund.portfolios.filter((port) => { 
      return `${port.user}` === `${req.user._id}` 
    })

    const populatedUserPortfolio = await Portfolio
      .findById(userPortfolio[0]._id)
      .populate('user')
      
    return { 
      _id: fund._id,
      admin: fund.admin,
      name: fund.name,
      maxPlayers: fund.maxPlayers,
      portfolios: fund.portfolios.map((fund) => fund._id),
      currentUserPortfolio: populatedUserPortfolio
    }

  }));

  console.log(newFunds);

  res.send(newFunds);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  
  const { name, maxPlayers } = req.body
  
  const portfolio = new Portfolio({ user: req.user });
  const fund = new Fund({ 
    admin: req.user,
    name: name,
    maxPlayers: maxPlayers,
    portfolios: [portfolio]
  });

  await Promise.all([portfolio.save(), fund.save()]) 

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