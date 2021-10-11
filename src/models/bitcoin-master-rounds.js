import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
    {
        time: { type: Date, required: true },
        open: { type: Number, required: true },
        close: { type: Number, required: true },
    },
    { _id: false }
);

const settlementResultSchema = new mongoose.Schema(
    {
        odd: { type: Boolean, default: false },
        even: { type: Boolean, default: false },
        up: { type: Boolean, default: false },
        down: { type: Boolean, default: false },
    },
    { _id: false }
);

const Schema = new mongoose.Schema({
    id: { type: Number, required: true },
    result: resultSchema,
    settlementResult: settlementResultSchema,
    time: { type: Date, default: new Date() },
});

export const BitcoinMasterRounds = mongoose.model("BitcoinMaster_round", Schema);
