import { Core } from "sc-game-base";
import gameSettings from "../../game-settings";
import GameData from "../../bitcoin-master-game-data";
import BitcoinMasterBot from "../bitcoin-master-bot";

const definition = new Core.GameDefinition(gameSettings);
const gameConfigs = { odds: { odd: 1.98, even: 1.98, up: 1.98, down: 1.98 } };
const gameData = new GameData(gameSettings.durations.wholeRound);
gameData.gameConfigs = gameConfigs;
gameData.roundId = 1;

const betsRepository = {
    updateOne: jest.fn(),
};
const betLogsRepository = {};
const userInfosRepository = {};

const bot = new BitcoinMasterBot(definition, gameData, null, userInfosRepository, betsRepository, betLogsRepository);

describe("getBetChoicesToBalance tests", () => {
    it.each([
        [{}, ["up", "down"]],
        [{ up: 10, down: 10, even: 80 }, ["up", "down"]],
        [{ up: 60, down: 10, even: 30 }, ["even", "odd"]],
    ])("should return correct choices based on current total bets", (totaBets, expectedChoices) => {
        gameData.totalBets = totaBets;

        const choices = bot.getBetChoicesToBalance();

        expect(choices).toEqual(expectedChoices);
    });
});

describe("upsertBet tests", () => {
    it("should upsert the bet correctly", async () => {
        await bot.upsertBet({ id: 1 }, "up", 100);

        expect(betsRepository.updateOne).toHaveBeenCalled();
    });
});
