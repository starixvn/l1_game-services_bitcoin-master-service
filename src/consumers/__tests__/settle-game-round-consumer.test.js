import { stubMongooseModelStupidly } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { Core } from "sc-game-base";

import BitcoinMasterSettleGameRoundConsumer from "../bitcoin-master-settle-game-round-consumer";
import { getSettlementResult } from "../../helpers/result-helper";
import gameSettings from "../../game-settings";
import GameData from "../../bitcoin-master-game-data";
import RoundResultPublisher from "sc-game-base/src/core/event-publishers/round-result-publisher";
import UserBetResultPublisher from "sc-game-base/src/core/event-publishers/user-bet-result-publisher";

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
const userInfosRepository = stubMongooseModelStupidly(mongoose.Model);

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
        userInfosRepository,
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

            const expectedWinBetLog = { uid: 1, amount: 200, choice: "up", save: jest.fn() };

            const betLogs = [expectedWinBetLog];
            const bet = { uid: 1, up: 200 };

            betLogsRepository.find().exec = jest.fn().mockReturnValueOnce(betLogs);
            betsRepository.find().lean().exec.mockReturnValueOnce([bet]);
            userInfosRepository.find().lean().exec.mockReturnValueOnce([]);
            // act
            await consumer.settleRound();

            // asset
            betLogs.forEach((betLog) => expect(betLog.save).toHaveBeenCalled());
            expect(expectedWinBetLog.refund).toEqual(100);
            expect(expectedWinBetLog.betwin).toEqual(100 * (gameConfigs.odds.even - 1));
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

            const expectedWinBetLog = { uid: 1, amount: 200, choice: "up", save: jest.fn() };

            const betLogs = [expectedWinBetLog];
            const bet = { uid: 1, up: 200 };

            betLogsRepository.find().exec = jest.fn().mockReturnValueOnce(betLogs);
            betsRepository.find().lean().exec.mockReturnValueOnce([bet]);
            userInfosRepository.find().lean().exec.mockReturnValueOnce([]);
            // act
            await consumer.settleRound();

            // asset
            betLogs.forEach((betLog) => expect(betLog.save).toHaveBeenCalled());
            expect(expectedWinBetLog.refund).toEqual(100);
            expect(expectedWinBetLog.betwin).toEqual(0);
        });

        it("open = close, should refund all up & down bets correctly", async () => {
            gameData.open = 400;
            gameData.cryptoExchange = {
                runningCandleStick: {
                    close: 400,
                    open: 400,
                },
            };
            gameData.totalBets = { odd: 300, even: 200, up: 200, down: 100 };
            // arrange
            const expectedRefundBetLog = { uid: 1, amount: 200, choice: "up", save: jest.fn() };
            const expectedWinBetLog = { uid: 1, amount: 200, choice: "even", save: jest.fn() };

            const betLogs = [expectedWinBetLog, expectedRefundBetLog];
            const bet = { uid: 1, even: 200, up: 200 };

            betLogsRepository.find().exec = jest.fn().mockReturnValueOnce(betLogs);
            betsRepository.find().lean().exec.mockReturnValueOnce([bet]);
            userInfosRepository.find().lean().exec.mockReturnValueOnce([]);
            // act
            await consumer.settleRound();

            // asset
            betLogs.forEach((betLog) => expect(betLog.save).toHaveBeenCalled());
            expect(expectedRefundBetLog.refund).toEqual(expectedRefundBetLog.amount);
            expect(expectedWinBetLog.betwin).toEqual(expectedRefundBetLog.amount * (gameConfigs.odds.even - 1));
        });
    });
});

afterEach(() => {
    jest.clearAllMocks();
});
