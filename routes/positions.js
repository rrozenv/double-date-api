const {Position, validate} = require('../models/position'); 
const Fund = require('../models/fund').Fund; 
const Portfolio = require('../models/portfolio').Portfolio; 
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const { type, ticker, buyPrice, currentPrice, shares, fundIds } = req.body

  //1. Find funds with given fund ids
  const funds = await Fund.find({ _id: { $in: fundIds } })
    .populate({
      path: 'portfolios',
      model: 'Portfolio'
    });
  
  const position = new Position(
    { type: type, 
      ticker: ticker, 
      buyPrice: buyPrice, 
      currentPrice: currentPrice,
      shares: shares,
      fundIds: fundIds
    });

 funds.forEach(async (fund) => {
  
      //2. Find user portfolio inside fund 
      const userPortfolio = fund.portfolios.filter((port) => { 
        return `${port.user}` === `${req.user._id}` 
      })
  
      const populatedPort = await Portfolio
        .findById(userPortfolio[0]._id)
        .populate({
          path: 'positions',
          model: 'Position'
        });
        
      //3. Add position to portfolio 
      populatedPort.positions.push(position);

      await populatedPort.save()

  });

  console.log(position);
  
  res.send(position);
});

module.exports = router;
