import { RunningRoundInfoPublisher } from "sc-pool-betting-game-base";

export class BitcoinMasterRunningRoundInfoPublisher extends RunningRoundInfoPublisher {
    calculateBetPercentage(choices) {
        const betPercentage = {};

        calculatePercentageOnChoicePair(betPercentage, ["up", "down"]);
        calculatePercentageOnChoicePair(betPercentage, ["odd", "even"]);

        return betPercentage;
    }

    calculatePercentageOnChoicePair(betPercentage, choices) {
        const { betCount } = this.gameData;

        const totalBetCount = betCount[choices[0]] ?? 0 + betCount[choices[1]] ?? 0;

        if (totalBetCount > 0) {
            betPercentage[choices[0]] = parseInt((betCount[choices[0]] ?? 0 * 100) / totalBetCount);
            betPercentage[choices[1]] = 100 - betPercentage[choices[0]];
        }
    }
}
