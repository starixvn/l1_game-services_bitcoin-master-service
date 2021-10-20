import { Core } from "sc-game-base";
import gameSettings from "../../game-settings";
import GameData from "../../bitcoin-master-game-data";
import BitcoinMasterSettleGameRoundConsumer from "../../consumers/bitcoin-master-settle-game-round-consumer";
import BitcoinMasterGameCron from "../bitcoin-master-game-cron";
import BitcoinMasterRunningRoundInfoPublisher from "../../event-publishers/bitcoin-master-running-round-info-publisher";
import ChartClientPublisher from "../../event-publishers/chart-client-publisher";

jest.mock("../../consumers/bitcoin-master-settle-game-round-consumer");
jest.mock("../../event-publishers/bitcoin-master-running-round-info-publisher");
jest.mock("../../event-publishers/chart-client-publisher");
jest.mock("cron");
jest.useFakeTimers();

const definition = new Core.GameDefinition(gameSettings);
const gameConfigs = { odds: { odd: 1.98, even: 1.98, up: 1.98, down: 1.98 } };
const gameData = new GameData(gameSettings.durations.wholeRound);
gameData.gameConfigs = gameConfigs;
gameData.roundId = 1;
const settleGameRoundConsumer = new BitcoinMasterSettleGameRoundConsumer();
const runningRoundInfoPublisher = new BitcoinMasterRunningRoundInfoPublisher();
const chartClientPublisher = new ChartClientPublisher();

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

const cron = new BitcoinMasterGameCron({
    definition,
    gameData,
    settleGameRoundConsumer,
    cryptoExchangesRepository,
    runningRoundInfoPublisher,
    chartClientPublisher,
    roundsRepository,
    betsRepository,
    cryptoCandleSticksRepository,
    archiveStatusesRepository,
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
                open: 100,
                close: 200,
                high: 250,
                low: 100,
            },
        });

        await cron.processUnsettledBets({ id: 1, result: { time: new Date() } });

        expect(gameData.open).toEqual(100);
        expect(settleGameRoundConsumer.settleRound).toHaveBeenCalled();
    });
});


afterEach(() => {
    jest.clearAllMocks();
});
