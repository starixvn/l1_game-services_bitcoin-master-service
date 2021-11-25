import mongoose from "mongoose";

const Schema = new mongoose.Schema({
  updatedTime: { type: Date, default: new Date() },
  binance: { type: Array, required: true },
  huobi: { type: Array, required: true },
  mexc: { type: Array, required: true },
  okex: { type: Array, required: true },
  averageCandleSticks: { type: Array, required: true },
  runningCandleStick: { type: Object, required: true },
});

const CryptoExchanges = mongoose.model("crypto_exchanges", Schema);

export default CryptoExchanges;
