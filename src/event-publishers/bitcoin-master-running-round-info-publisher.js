import { RunningRoundInfoPublisher } from "sc-pool-betting-game-base";

export default class BitcoinMasterRunningRoundInfoPublisher extends RunningRoundInfoPublisher {
    calculateBetPercentage(choices) {
        const betPercentage = {};

        this.calculatePercentageOnChoicePair(betPercentage, ["up", "down"]);
        this.calculatePercentageOnChoicePair(betPercentage, ["even", "odd"]);

        return betPercentage;
    }

    calculatePercentageOnChoicePair(betPercentage, choices) {
        const { betCount } = this.gameData;
        console.log(betCount);
        const totalBetCount = (betCount[choices[0]] ?? 0) + (betCount[choices[1]] ?? 0);

        if (totalBetCount > 0) {
            betPercentage[choices[0]] = parseInt(((betCount[choices[0]] ?? 0) * 100) / totalBetCount);
            betPercentage[choices[1]] = 100 - betPercentage[choices[0]];
        }
    }
}
