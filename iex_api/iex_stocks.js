const request = require('superagent');
const Stock = require('../models/stock').Stock; 

async function fetchStocks(typesString, tickersString) {
    const tickersArray = tickersString.split(',');

    if (tickersArray.length > 0) {
        const payload = await request
            .get('https://api.iextrading.com/1.0/stock/market/batch')
            .query({ types: typesString, symbols: tickersString })
    
        const stocks = tickersArray.map((ticker) => { 
            return { 
                symbol: payload.body[ticker.toUpperCase()].quote.symbol,
                companyName: payload.body[ticker.toUpperCase()].quote.companyName,
                latestPrice: payload.body[ticker.toUpperCase()].quote.latestPrice,
                changePercent: payload.body[ticker.toUpperCase()].quote.changePercent
            }
        });
        console.log(`Ticker length ${tickersArray.length}`)
        return stocks
    } else {
        console.log(`Returning empty array`)
        return []
    }

}

async function fetchCurrentPricesFor(positions) {
    const tickersString = positions.map(pos => pos.ticker).toString();
    const stocks = await fetchStocks('quote', tickersString);

    positions.forEach(async (pos) => { 
      const stock = stocks.find((stock) => stock.symbol.toLowerCase() === pos.ticker.toLowerCase());
      pos.currentPrice = stock.latestPrice
      await pos.save();
    });

    return positions
}

async function saveStockTickersToDB() {
    const stocksPayload = await request
        .get('https://api.iextrading.com/1.0/ref-data/symbols');

    stocksPayload.body.forEach(async (load) => { 
        const stock = new Stock({ 
            symbol: load.symbol,
            companyName: load.name
        })
        await stock.save()
    });
}

exports.fetchStocks = fetchStocks;
exports.fetchCurrentPricesFor = fetchCurrentPricesFor;
exports.saveStockTickersToDB = saveStockTickersToDB;