export function uglifyCandleStick(candleStick) {
    return {
        t: candleStick.time,
        o: candleStick.open,
        c: candleStick.close,
        h: candleStick.high,
        l: candleStick.low,
    };
}
