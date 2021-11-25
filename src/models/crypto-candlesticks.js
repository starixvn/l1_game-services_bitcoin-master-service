import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    time: { type: Date, default: new Date() },
    average: { type: Object, required: true },
    binance: { type: Number, required: true },
    huobi: { type: Number, required: true },
    mexc: { type: Number, required: true },
    okex: { type: Number, required: true },
});

const CryptoCandleSticks = mongoose.model("crypto_candlesticks", Schema);

export default CryptoCandleSticks;
