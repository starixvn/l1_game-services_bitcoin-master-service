import { Core } from "sc-game-base";
import gameSettings from "../../game-settings";
import GameData from "../../bitcoin-master-game-data";
import BitcoinMasterProcessBetQueue from "../bitcoin-master-process-bet-queue";

const definition = new Core.GameDefinition(gameSettings);
const gameConfigs = { odds: { odd: 1.98, even: 1.98, up: 1.98, down: 1.98 } };
const gameData = new GameData(gameSettings.durations.wholeRound);
gameData.gameConfigs = gameConfigs;
gameData.roundId = 1;

const betsRepository = {
    create: jest.fn(),
};

const processBetQueue = new BitcoinMasterProcessBetQueue({ definition, gameConfigs, betsRepository });

describe("insert bet tests", () => {
    it("insert bet correctly", async () => {
        await processBetQueue.insertBet(
            { UID: 1, profile: { name: "player" }, session: { memberId: 100, siteId: "lumi" } },
            { betChoice: "up", amount: 100 },
            1,
            gameConfigs
        );

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
