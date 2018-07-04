const request = require('superagent');

async function fetchStocks(typesString, tickersString) {
    const tickersArray = tickersString.split(',');

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

    return stocks
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

exports.fetchStocks = fetchStocks;
exports.fetchCurrentPricesFor = fetchCurrentPricesFor;
//module.exports = fetchCurrentPricesFor;