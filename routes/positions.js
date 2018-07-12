const {Position, validate} = require('../models/position'); 
const Fund = require('../models/fund').Fund; 
const Portfolio = require('../models/portfolio').Portfolio; 
const User = require('../models/user').User;
const fetchStocks = require('../iex_api/iex_stocks').fetchStocks; 
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  let positions = await Position.find({ user: req.user._id });
  const tickersString = positions.map((pos) => pos.ticker).toString();
  const stocks = await fetchStocks('quote', tickersString);

  positions.forEach(async (pos) => { 
    const stock = stocks.find((stock) => stock.symbol.toLowerCase() === pos.ticker.toLowerCase());
    pos.currentPrice = stock.latestPrice
    await pos.save();
  });

  console.log(positions);

  res.send(positions);
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
    { user: req.user,
      type: type, 
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

      //4. Update cash balance
      const positionCost = buyPrice * shares
      populatedPort.cashBalance -= positionCost
      
      await Promise.all([position.save(), populatedPort.save()]) 

  });

  console.log(position);
  
  res.send(position);
});

module.exports = router;
