export function uglifyCandleStick(candleStick) {
    return {
        t: candleStick.time,
        o: candleStick.open,
        c: candleStick.close,
        h: candleStick.high,
        l: candleStick.low,
    };
}
export function getLatest(cryptoExchange) {
    const { averageCandleSticks, binance, huobi, mexc, okex } = cryptoExchange;

    return {
        a: uglifyCandleStick(averageCandleSticks[averageCandleSticks.length - 1]),
        b: uglifyCandleStick(binance[binance.length - 1]),
        h: uglifyCandleStick(huobi[huobi.length - 1]),
        m: uglifyCandleStick(mexc[mexc.length - 1]),
        o: uglifyCandleStick(okex[okex.length - 1]),
    };
}

export function getAll(cryptoExchange) {
    const { averageCandleSticks, binance, huobi, mexc, okex } = cryptoExchange;

    return {
        a: averageCandleSticks.map((x) => uglifyCandleStick(x)),
        b: binance.map((x) => uglifyCandleStick(x)),
        h: huobi.map((x) => uglifyCandleStick(x)),
        m: mexc.map((x) => uglifyCandleStick(x)),
        o: okex.map((x) => uglifyCandleStick(x)),
    };
}
