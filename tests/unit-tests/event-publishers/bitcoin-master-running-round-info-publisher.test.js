import gameSettings from "../../../src/game-settings";
import GameData from "../../../src/bitcoin-master-game-data";
import BitcoinMasterRunningRoundInfoPublisher from "../../../src/event-publishers/bitcoin-master-running-round-info-publisher";

const gameData = new GameData(gameSettings.durations.wholeRound);
gameData.roundId = 1;

const publisher = new BitcoinMasterRunningRoundInfoPublisher("bitcoinmaster", gameData);

describe("calculateBetPercentage tests", () => {
    it.each([
        [
            {
                up: 10,
                even: 30,
            },
            { up: 100, down: 0, even: 100, odd: 0 },
        ],
        [
            {
                down: 10,
                odd: 30,
            },
            { up: 0, down: 100, even: 0, odd: 100 },
        ],
        [
            {
                up: 10,
                down: 30,
                even: 30,
                odd: 40,
            },
            { up: 25, down: 75, even: 42, odd: 58 },
        ],
        [{}, {}],
    ])("should calculate correctly", (betCount, expetedResult) => {
        gameData.betCount = betCount;

        const result = publisher.calculateBetPercentage();

        expect(result).toEqual(expetedResult);
    });
});
