import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    time: { type: Date, default: new Date() },
    open: { type: Number, required: true },
    close: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
});

const CryptoCandleSticks = mongoose.model("crypto_candlesticks", Schema);

export default CryptoCandleSticks;
