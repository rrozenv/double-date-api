const Portfolio = require('../models/portfolio').Portfolio; 
const fetchStocks = require('../iex_api/iex_stocks').fetchStocks; 
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const portIds = req.query.ids.split(",")
  const portfolios = await Portfolio
    .find({ _id: { $in: portIds } })
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

  const tickersArray = portfolios.map((port) => { 
    return port.positions.map((pos) => pos.ticker).toString();
  });

  const tickersString = [...new Set(tickersArray)].toString()
  
  if (tickersString !== '') { 
    const stocks = await fetchStocks('quote', tickersString);
    portfolios.forEach(async (port) => { 
        port.positions.forEach(async (pos) => { 
            const stock = stocks.find((stock) => stock.symbol.toLowerCase() === pos.ticker.toLowerCase());
            pos.currentPrice = stock.latestPrice
            await pos.save();
          });
      });
    
    console.log(portfolios);
  }
 
  res.send(portfolios);
});

module.exports = router;