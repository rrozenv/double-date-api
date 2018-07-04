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

module.exports = router;


    // request
    //     .get('https://api.iextrading.com/1.0/stock/market/batch')
    //     .query({ types: 'quote', symbols: tickersString })
    //     .then((res) => {
    //         const stocks = tickersArray.map((ticker) => { 
    //             return { 
    //                 symbol: res.body[ticker.toUpperCase()].quote.symbol,
    //                 companyName: res.body[ticker.toUpperCase()].quote.companyName,
    //                 latestPrice: res.body[ticker.toUpperCase()].quote.latestPrice,
    //                 changePercent: res.body[ticker.toUpperCase()].quote.changePercent
    //             }
    //         });

    //         console.log(stocks);
    //         res.send(stocks);
    //     })
    //     .catch((err) => {
    //         console.log(err.message);
    //     });