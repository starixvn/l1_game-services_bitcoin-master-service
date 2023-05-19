import { stubMongooseModelStupidly } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { Core } from "sc-game-base";

import RoundResultPublisher from "sc-game-base/src/core/event-publishers/round-result-publisher";
import UserBetResultPublisher from "sc-game-base/src/core/event-publishers/user-bet-result-publisher";
import GameData from "../../../src/bitcoin-master-game-data";
import BitcoinMasterSettleGameRoundConsumer from "../../../src/consumers/bitcoin-master-settle-game-round-consumer";
import gameSettings from "../../../src/game-settings";
import { getSettlementResult } from "../../../src/helpers/result-helper";

jest.mock("sc-game-base/src/core/event-publishers/round-result-publisher");
jest.mock("sc-game-base/src/core/event-publishers/user-bet-result-publisher");

const definition = new Core.GameDefinition(gameSettings, null, getSettlementResult);
const gameConfigs = { odds: { odd: 1.98, even: 1.98, up: 1.98, down: 1.98 } };
const gameData = new GameData(0);
gameData.gameConfigs = gameConfigs;
gameData.roundId = 1;

const roundResultPublisher = new RoundResultPublisher();

const userBetResultPublisher = new UserBetResultPublisher();

const endGame = jest.fn(() => ({ isOk: true }));

/** @type {mongoose.Model}*/
const roundsRepository = { create: jest.fn((obj) => obj) };

/** @type {mongoose.Model}*/
const betsRepository = stubMongooseModelStupidly(mongoose.Model);
betsRepository.updateOne = jest.fn();

/** @type {mongoose.Model}*/
const betLogsRepository = stubMongooseModelStupidly(mongoose.Model);

/** @type {mongoose.Model}*/
const currencyRepository = stubMongooseModelStupidly(mongoose.Model);

describe("SettleGameRoundConsumer test", () => {
    const consumer = new BitcoinMasterSettleGameRoundConsumer({
        definition,
        gameData,
        roundResultPublisher,
        userBetResultPublisher,
        endGame,
        roundsRepository,
        betsRepository,
        betLogsRepository,
        currencyRepository,
    });
    describe("settle round tests", () => {
        it("open < close, should settle correctly", async () => {
            gameData.open = 400;
            gameData.cryptoExchange = {
                runningCandleStick: {
                    close: 500,
                    open: 400,
                },
            };
            gameData.totalBets = { odd: 300, even: 200, up: 200, down: 100 };
            // arrange

            const expectedWinBetLog = { uid: 1, amount: 200, baseAmount: 200, choice: "up", rate: 1, save: jest.fn() };

            const betLogs = [expectedWinBetLog];
            const bet = { uid: 1, up: 200, rate: 1 };

            betLogsRepository.find().exec = jest.fn().mockReturnValueOnce(betLogs);
            betsRepository.find().lean().exec.mockReturnValueOnce([bet]);
            currencyRepository.find().lean().exec.mockReturnValueOnce([]);
            // act
            await consumer.settleRound();

            // assert
            betLogs.forEach((betLog) => expect(betLog.save).toHaveBeenCalled());
            expect(parseFloat(expectedWinBetLog.refund)).toEqual(100);
            expect(parseFloat(expectedWinBetLog.betwin)).toEqual(100 * (gameConfigs.odds.even - 1));
        });

        it("open > close, should settle correctly", async () => {
            gameData.open = 400;
            gameData.cryptoExchange = {
                runningCandleStick: {
                    close: 300,
                    open: 400,
                },
            };
            gameData.totalBets = { odd: 300, even: 200, up: 200, down: 100 };
            // arrange

            const expectedWinBetLog = { uid: 1, amount: 200, baseAmount: 200, choice: "up", rate: 1, save: jest.fn() };

            const betLogs = [expectedWinBetLog];
            const bet = { uid: 1, up: 200, rate: 1 };

            betLogsRepository.find().exec = jest.fn().mockReturnValueOnce(betLogs);
            betsRepository.find().lean().exec.mockReturnValueOnce([bet]);
            currencyRepository.find().lean().exec.mockReturnValueOnce([]);
            // act
            await consumer.settleRound();

            // assert
            betLogs.forEach((betLog) => expect(betLog.save).toHaveBeenCalled());
            expect(parseFloat(expectedWinBetLog.refund)).toEqual(100);
            expect(parseFloat(expectedWinBetLog.betwin)).toEqual(0);
        });

        it.each([
            [
                { uid: 1, amount: 200, baseAmount: 200, choice: "up", rate: 1, currency: "$US", save: jest.fn() },
                { uid: 1, amount: 200, baseAmount: 200, choice: "even", rate: 1, currency: "$US", save: jest.fn() },
                { odd: 300, even: 200, up: 200, down: 100 },
            ],
            [
                { uid: 1, amount: 200, baseAmount: 20000, choice: "up", rate: 100, currency: "$US", save: jest.fn() },
                { uid: 1, amount: 200, baseAmount: 20000, choice: "even", rate: 100, currency: "$US", save: jest.fn() },
                { odd: 30000, even: 20000, up: 20000, down: 1000 },
            ],
        ])("open = close, should refund all up & down bets correctly", async (expectedRefundBetLog, expectedWinBetLog, totalBets) => {
            gameData.open = 400;
            gameData.cryptoExchange = {
                runningCandleStick: {
                    close: 400,
                    open: 400,
                },
            };
            gameData.totalBets = totalBets;
            // arrange
            const betLogs = [expectedWinBetLog, expectedRefundBetLog];
            const bet = { uid: 1, even: 200, up: 200, rate: 1 };

            betLogsRepository.find().exec = jest.fn().mockReturnValueOnce(betLogs);
            betsRepository.find().lean().exec.mockReturnValueOnce([bet]);
            currencyRepository.find().lean().exec.mockReturnValueOnce([]);
            // act
            await consumer.settleRound();

            // assert
            betLogs.forEach((betLog) => expect(betLog.save).toHaveBeenCalled());
            expect(parseFloat(expectedRefundBetLog.refund)).toEqual(expectedRefundBetLog.amount);
            expect(parseFloat(expectedWinBetLog.betwin)).toEqual(expectedWinBetLog.amount * (gameConfigs.odds.even - 1));
        });
    });
});

afterEach(() => {
    jest.clearAllMocks();
});
