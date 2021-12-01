import mongoose from "mongoose";

const betLogSchema = {
    uid: { type: String, required: true },
    name: { type: String, required: true },
    phien: { type: Number, required: true },

    choice: { type: String, required: true },
    amount: { type: Number, required: true },
    baseAmount: { type: Number, required: true },

    thanhtoan: { type: Boolean, default: false },

    refund: { type: Number, default: 0 },
    baseRefund: { type: Number, default: 0 },

    win: { type: Boolean, default: false },

    betwin: { type: Number, default: 0 },
    baseBetWin: { type: Number, default: 0 },

    time: { type: Date },

    memberId: { type: Number },
    siteId: { type: String },
    currency: { type: String, require: true },
    rate: { type: Number, require: true },
    partnerId: { type: String, require: true },
};

const betSchema = new mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    phien: { type: Number, required: true },

    up: { type: Number, required: true, default: 0 },
    down: { type: Number, required: true, default: 0 },
    odd: { type: Number, required: true, default: 0 },
    even: { type: Number, required: true, default: 0 },

    totalAmount: { type: Number, required: true, default: 0 },
    baseTotalAmount: { type: Number, required: true, default: 0 },

    totalWin: { type: Number, required: true, default: 0 },
    baseTotalWin: { type: Number, default: 0 },

    thanhtoan: { type: Boolean, default: false },
    refund: { type: Number, default: 0 },
    baseRefund: { type: Number, default: 0 },

    betwin: { type: Number, default: 0 },
    baseBetWin: { type: Number, default: 0 },

    time: { type: Date },
    odds: { type: Object },

    memberId: { type: Number },
    siteId: { type: String },
    currency: { type: String, require: true },
    rate: { type: Number, require: true },
    partnerId: { type: String, require: true },
});

const BitcoinMasterBets = mongoose.model("bitcoinmaster_bet", betSchema);
const BitcoinMasterBetLogs = mongoose.model("bitcoinmaster_betlog", betLogSchema);

export { BitcoinMasterBets, BitcoinMasterBetLogs };
