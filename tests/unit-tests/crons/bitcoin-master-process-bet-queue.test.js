import { Core } from "sc-game-base";
import gameSettings from "../../../src/game-settings";
import GameData from "../../../src/bitcoin-master-game-data";
import BitcoinMasterProcessBetQueue from "../../../src/crons/bitcoin-master-process-bet-queue";

const definition = new Core.GameDefinition(gameSettings);
const gameConfigs = { odds: { odd: 1.98, even: 1.98, up: 1.98, down: 1.98 } };
const gameData = new GameData(gameSettings.durations.wholeRound);
gameData.gameConfigs = gameConfigs;
gameData.roundId = 1;

const betsRepository = {
    execFn: jest.fn(),
    create: jest.fn(),
    findOne: () => ({
        exec: betsRepository.execFn,
    }),
};

const processBetQueue = new BitcoinMasterProcessBetQueue({ definition, gameData, gameConfigs, betsRepository });

const player = { UID: 1, profile: { name: "player" }, session: { playerId: "100", siteId: "lumi" } };

describe("insert bet tests", () => {
    it("insert bet correctly", async () => {
        await processBetQueue.insertBet(player, { betChoice: "up", amount: 100 }, 1, gameConfigs);

        expect(betsRepository.create).toHaveBeenCalled();
    });
});

describe("update bet tests", () => {
    it("update bet correctly", async () => {
        const existingBet = { up: 100, totalAmount: 100, save: jest.fn() };
        await processBetQueue.updateBet(existingBet, { betChoice: "up", amount: 20 });

        expect(existingBet.save).toHaveBeenCalled();
        expect(existingBet.up).toEqual(120);
        expect(existingBet.totalAmount).toEqual(120);
    });
});

describe("upsertBet bet tests", () => {
    it("bet exists - should call updatebet", async () => {
        const existingBet = { up: 100, totalAmount: 100, save: jest.fn() };
        betsRepository.findOne().exec.mockReturnValueOnce(existingBet);

        await processBetQueue.upsertBet(player, 1, { betChoice: "up", amount: 20 });

        expect(existingBet.save).toHaveBeenCalled();
        expect(existingBet.up).toEqual(120);
        expect(existingBet.totalAmount).toEqual(120);
    });

    it("bet doesnt exist - should call insert bet & update betcount", async () => {
        betsRepository.findOne().exec.mockReturnValueOnce(null);

        await processBetQueue.upsertBet(player, 1, { betChoice: "up", amount: 20 });
        expect(betsRepository.create).toHaveBeenCalled();
        expect(gameData.betCount.up).toEqual(1);
    });
});

afterEach(() => {
    jest.clearAllMocks();
});
