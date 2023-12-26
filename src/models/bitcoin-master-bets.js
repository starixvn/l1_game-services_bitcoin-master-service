import mongoose from "mongoose";

const betLogSchema = {
    uid: { type: String, required: true },
    name: { type: String, required: true },

    choice: { type: String, required: true },
    amount: { type: Number, required: true },
    baseAmount: { type: Number, required: true },

    refund: { type: Number, default: 0 },
    baseRefund: { type: Number, default: 0 },

    win: { type: Boolean, default: false },

    betwin: { type: Number, default: 0 },
    baseBetWin: { type: Number, default: 0 },

    time: { type: Date },

    siteId: { type: String },
    currency: { type: String, required: true },
    rate: { type: Number, required: true },
    playerId: { type: String },
    operatorId: { type: String, required: true },
    roundId: { type: Number, required: true },
    paid: { type: Boolean, default: false },
};

const betSchema = new mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },

    up: { type: Number, required: true, default: 0 },
    down: { type: Number, required: true, default: 0 },
    odd: { type: Number, required: true, default: 0 },
    even: { type: Number, required: true, default: 0 },

    totalAmount: { type: Number, required: true, default: 0 },
    baseTotalAmount: { type: Number, required: true, default: 0 },

    totalWin: { type: Number, required: true, default: 0 },
    baseTotalWin: { type: Number, default: 0 },

    refund: { type: Number, default: 0 },
    baseRefund: { type: Number, default: 0 },

    betwin: { type: Number, default: 0 },
    baseBetWin: { type: Number, default: 0 },

    time: { type: Date },
    odds: { type: Object },

    siteId: { type: String },
    currency: { type: String },
    rate: { type: Number, required: true },

    playerId: { type: String },
    operatorId: { type: String },
    roundId: { type: Number, required: true },
    paid: { type: Boolean, default: false },
});

const BitcoinMasterBets = mongoose.model("bitcoinmaster_bet", betSchema);
const BitcoinMasterBetLogs = mongoose.model("bitcoinmaster_betlog", betLogSchema);

export { BitcoinMasterBets, BitcoinMasterBetLogs };
