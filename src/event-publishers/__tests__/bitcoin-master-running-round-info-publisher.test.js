import gameSettings from "../../game-settings";
import GameData from "../../bitcoin-master-game-data";
import BitcoinMasterRunningRoundInfoPublisher from "../bitcoin-master-running-round-info-publisher";

const gameData = new GameData(gameSettings.durations.wholeRound);
gameData.roundId = 1;

const publisher = new BitcoinMasterRunningRoundInfoPublisher("bitcoinmaster", gameData);

describe("calculateBetPercentage tests", () => {
    it("should calculate correctly", () => {
        gameData.betCount = {
            up: 10,
            down: 30,
            even: 30,
            odd: 40,
        };
        debugger;
        const result = publisher.calculateBetPercentage();

        expect(result).toEqual({ up: 25, down: 75, even: 42, odd: 58 });
    });
});
