const Stock = require('../models/stock').Stock; 
const fetchStocks = require('../iex_api/iex_stocks').fetchStocks; 
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const tickersString = req.query.symbols.replace(/\s+/g, '')
    const typesString = req.query.types.replace(/\s+/g, '')
    
    const stocks = await fetchStocks(typesString, tickersString);

    console.log(stocks);
    res.send(stocks);
});

router.get('/search', async (req, res) => {
    const { isExact, query } = req.query
    if (isExact) {
        const exactStocks = await findExactStocksFor(query);
        res.send(exactStocks);
    } else {
        const stocks = await Stock.find({ $text: { $search: query } });
        res.send(stocks);
    }
});

async function findExactStocksFor(query) {
    const tickersArray = query.split(',');
    const stocks = await Promise.all(tickersArray.map(async (ticker) => { 
       const stock = await Stock.findOne({ symbol: ticker.toUpperCase() })
       return stock
    }));
    return stocks
}

module.exports = router;