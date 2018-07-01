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

module.exports = fetchStocks;