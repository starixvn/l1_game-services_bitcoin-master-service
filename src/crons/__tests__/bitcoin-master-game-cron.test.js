import { Core } from "sc-game-base";
import gameSettings from "../../game-settings";
import GameData from "../../bitcoin-master-game-data";
import BitcoinMasterSettleGameRoundConsumer from "../../consumers/bitcoin-master-settle-game-round-consumer";
import BitcoinMasterGameCron from "../bitcoin-master-game-cron";
import BitcoinMasterRunningRoundInfoPublisher from "../../event-publishers/bitcoin-master-running-round-info-publisher";
import ChartClientPublisher from "../../event-publishers/chart-client-publisher";
import GameStatusPublisher from "sc-game-base/src/core/event-publishers/game-status-publisher";
import { stubMongooseModelStupidly } from "jest-micro-auto-stub";
import mongoose from "mongoose";

jest.useFakeTimers();

jest.mock("../../consumers/bitcoin-master-settle-game-round-consumer");
jest.mock("../../event-publishers/bitcoin-master-running-round-info-publisher");
jest.mock("../../event-publishers/chart-client-publisher");
jest.mock("sc-game-base/src/core/event-publishers/game-status-publisher");
jest.mock("cron");

const definition = new Core.GameDefinition(gameSettings);
const gameConfigs = { enabled: true, odds: { odd: 1.98, even: 1.98, up: 1.98, down: 1.98 } };
const gameData = new GameData(gameSettings.durations.wholeRound);
gameData.gameConfigs = gameConfigs;
gameData.roundId = 1;
const settleGameRoundConsumer = new BitcoinMasterSettleGameRoundConsumer();
const runningRoundInfoPublisher = new BitcoinMasterRunningRoundInfoPublisher();
const chartClientPublisher = new ChartClientPublisher();
const gameStatusPublisher = new GameStatusPublisher();

const mockLeanFnc = jest.fn();
const cryptoExchangesRepository = {
    findOne: () => ({
        lean: mockLeanFnc,
    }),
};

const cryptoCandleSticksRepository = {
    mockLeanFnc: jest.fn(),
    findOne: () => ({
        lean: cryptoCandleSticksRepository.mockLeanFnc,
    }),
};

const betsRepository = {
    exists: jest.fn(),
};

const roundsRepository = {
    mockExecFunc: jest.fn(),
    findOne: () => ({
        lean: () => ({ exec: roundsRepository.mockExecFunc }),
    }),
};

const archiveStatusesRepository = {
    mockExecFunc: jest.fn(),
    findOne: () => ({
        lean: () => ({ exec: archiveStatusesRepository.mockExecFunc }),
    }),
};

const gameConfigsRepository = {
    mockExecFunc: jest.fn(),
    findOne: () => ({
        lean: () => ({ exec: gameConfigsRepository.mockExecFunc }),
    }),
    updateOne: jest.fn(),
};

const notificationRepository = stubMongooseModelStupidly(mongoose.Model);

const cron = new BitcoinMasterGameCron({
    definition,
    gameData,
    settleGameRoundConsumer,
    cryptoExchangesRepository,
    runningRoundInfoPublisher,
    gameStatusPublisher,
    chartClientPublisher,
    roundsRepository,
    betsRepository,
    cryptoCandleSticksRepository,
    archiveStatusesRepository,
    notificationRepository,
    gameConfigsRepository,
});

describe("updateCryptoExchangeData tests", () => {
    it("should get crypto exchange and update to gameData", async () => {
        const data = {
            runningCandleSticks: {
                time: new Date(),
                open: 100,
                close: 200,
                high: 250,
                low: 100,
            },
        };
        mockLeanFnc.mockReturnValueOnce(data);

        await cron.updateCryptoExchangeData();
        expect(gameData.cryptoExchange).toEqual(data);
    });
});

describe("proceed tests", () => {
    it("should snapshot open price and send to clients when remaining time = snapshot open price time", async () => {
        const data = {
            runningCandleStick: {
                time: new Date(),
                open: 100,
                close: 200,
                high: 250,
                low: 100,
            },
        };
        mockLeanFnc.mockReturnValueOnce(data);

        gameData.disabled = false;
        gameData.remainingTime = gameSettings.durations.snapshotOpenPrice + 1;

        await cron.proceed();

        expect(runningRoundInfoPublisher.publishToAllUsers).toHaveBeenCalledWith({ open: gameData.open });
        expect(chartClientPublisher.publishToAllClients).toHaveBeenCalledWith(data);
    });

    it("should not snapshot open price and send to clients when remaining time <> snapshot open price time", async () => {
        const data = {
            runningCandleStick: {
                time: new Date(),
                open: 100,
                close: 200,
                high: 250,
                low: 100,
            },
        };
        mockLeanFnc.mockReturnValueOnce(data);

        gameData.disabled = false;
        gameData.remainingTime = gameSettings.durations.snapshotOpenPrice + 1;

        await cron.proceed();

        expect(runningRoundInfoPublisher.publishToAllUsers).not.toHaveBeenCalledWith();
        expect(chartClientPublisher.publishToAllClients).toHaveBeenCalledWith(data);
    });
});

describe("processUnsettledBets tests", () => {
    it("should call settleround when there are unsettled bets", async () => {
        betsRepository.exists.mockReturnValueOnce(true);
        cryptoCandleSticksRepository.mockLeanFnc.mockReturnValueOnce({
            average: {
                time: new Date(),
                open: 120,
                close: 200,
                high: 250,
                low: 100,
            },
        });

        await cron.processUnsettledBets({ id: 1, result: { time: new Date() } });

        await jest.runAllTimers();

        expect(gameData.open).toEqual(120);
        expect(settleGameRoundConsumer.settleRound).toHaveBeenCalled();
    });
    it("should not call settleround when there is no unsettled bets", async () => {
        betsRepository.exists.mockReturnValueOnce(false);

        await cron.processUnsettledBets({ id: 1, result: { time: new Date() } });

        expect(settleGameRoundConsumer.settleRound).not.toHaveBeenCalled();
    });
});

describe("start tests", () => {
    it("should start cron correctly", async () => {
        await cron.start();
        expect(roundsRepository.mockExecFunc).toHaveBeenCalled();
    });
});

describe("checkGameStatus tests", () => {
    it("game is enabled, should update gameData.gameConfigs and call publishStartGame", async () => {
        gameConfigs.enabled = true;
        gameData.disabled = false;
        gameData.remainingTime = definition.durations.wholeRound;
        gameConfigsRepository.mockExecFunc.mockReturnValueOnce(gameConfigs);

        await cron.checkGameStatus();

        expect(gameData.gameConfigs).toEqual(gameConfigs);
        expect(gameStatusPublisher.publishStartGame).toHaveBeenCalled();
    });

    it("game is disabled, should reset gameData.remainingTime, update game configs and call publishDisableGameStatus", async () => {
        gameConfigs.enabled = false;
        gameData.disabled = false;
        gameData.remainingTime = definition.durations.wholeRound;
        gameConfigsRepository.mockExecFunc.mockReturnValueOnce(gameConfigs);

        await cron.checkGameStatus();

        expect(gameData.gameConfigs).toEqual(gameConfigs);
        expect(gameData.remainingTime).toEqual(definition.durations.wholeRound);
        expect(gameConfigsRepository.updateOne).toHaveBeenCalled();
        expect(gameStatusPublisher.publishDisableGameStatus).toHaveBeenCalled();
    });

    it("game is currently disabled, then being enabled, should set delay start time", async () => {
        gameConfigs.enabled = true;
        gameData.disabled = true;
        gameData.remainingTime = definition.durations.wholeRound;
        gameConfigsRepository.mockExecFunc.mockReturnValueOnce(gameConfigs);

        await cron.checkGameStatus();

        expect(gameData.gameConfigs).toEqual(gameConfigs);
        expect(gameData.delayStartTime).toBeGreaterThan(0);
        expect(gameStatusPublisher.publishEnablingGameStatus).not.toHaveBeenCalled();
    });
});

afterEach(() => {
   jest.clearAllMocks();
});
