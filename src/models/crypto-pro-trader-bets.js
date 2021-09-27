import mongoose from "mongoose";

const betLogSchema = {
    uid: { type: String, required: true },
    name: { type: String, required: true },
    phien: { type: Number, required: true },

    choice: { type: String, required: true },
    amount: { type: Number, required: true },

    thanhtoan: { type: Boolean, default: false },
    refund: { type: Number, default: 0 },
    win: { type: Boolean, default: false },
    betwin: { type: Number, default: 0 },
    time: { type: Date },

    memberId: { type: Number },
    siteId: { type: String },
};

const betSchema = new mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    phien: { type: Number, required: true },

    over: { type: Number, required: true, default: 0 },
    under: { type: Number, required: true, default: 0 },
    odd: { type: Number, required: true, default: 0 },
    even: { type: Number, required: true, default: 0 },

    thanhtoan: { type: Boolean, default: false },
    refund: { type: Number, default: 0 },
    win: { type: Boolean, default: false },
    betwin: { type: Number, default: 0 },
    time: { type: Date },
    odds: { type: Object },

    memberId: { type: Number },
    siteId: { type: String },
});

const CryptoProTraderBets = mongoose.model("cryptoprotrader_one", betSchema);
const CryptoProTraderBetLogs = mongoose.model("cryptoprotrader_cuoc", betLogSchema);

export { CryptoProTraderBets, CryptoProTraderBetLogs };
