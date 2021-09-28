import { SettleGameRoundConsumer } from "sc-pool-betting-game-base";

export default class CryptoProTraderSettleGameRoundConsumer extends SettleGameRoundConsumer {
    async settleRound() {
        const { runningCandleStick } = this.gameData.cryptoExchange;

        const result = {
            open: runningCandleStick.open,
            close: runningCandleStick.close,
        };

        const settlementResult = this.definition.settle(result);

        const newRound = await this.roundsRepository.create({
            id: this.gameData.roundId,
            result,
            settlementResult,
            time: new Date(),
        });

        if (newRound) {
            const finish = {
                settlementResult,
                result,
                roundId: newRound.id,
                time: newRound.time,
            };

            this.gameData.roundId = finish.roundId + 1;

            await this.settleBets(finish);
        }
    }

    async settleBets({ result, settlementResult, roundId, time }) {
        const bets = await this.queryBets(roundId);

        if (bets && bets.length) {
            const uusUsers = await this.userInfosRepository.find({ currency: "UUS" }, "id").lean().exec();
            const uusUserIds = uusUsers.map((user) => user.id);

            await Promise.all(this.settleOverUnder(uusUserIds, bets, roundId, settlementResult));
            await Promise.all(this.settleOddEven(uusUserIds, bets, roundId, settlementResult));

            const settledBets = await this.querySettledBets(roundId);

            await Promise.all(
                settledBets.map(async (bet) => {
                    const betResult = this.calculateBetResult(bet);

                    await this.callEndGame(bet, roundId, time, betResult);
                    this.captureBetResult(bet.uid, betResult);

                    if (bet.memberId) {
                        this.userBetResultPublisher.publish(bet.uid, betResult);
                    }
                })
            );
        }

        this.roundResultPublisher.publishRoundResult(this.collectRoundResult(result, settlementResult, roundId));
    }

    settleOverUnder(uusUserIds, bets, roundId, settlementResult) {
        const choices = ["over", "under"];

        if (settlementResult.over || settlementResult.under) {
            const realBets = bets.filter((bet) => !uusUserIds.includes(bet.uid) && choices.includes(bet.choice));
            const uusBets = bets.filter((bet) => uusUserIds.includes(bet.uid) && choices.includes(bet.choice));
            const realBetProcessors = this.settleBetsByGroup(realBets, roundId, settlementResult, this.gameData.totalBets, choices);
            const uusBetProcessors = this.settleBetsByGroup(uusBets, roundId, settlementResult, this.gameData.totalUUSBets, choices);

            return realBetProcessors.concat(uusBetProcessors);
        } else {
            const overUnderBets = bets.filter((bet) => choices.includes(bet.choice));

            return overUnderBets.map((bet) => this.settleBet(bet, roundId, settlementResult, { choice: bet.choice, amount: bet.amount }));
        }
    }

    settleOddEven(uusUserIds, bets, roundId, settlementResult) {
        const choices = ["odd", "even"];

        const realBets = bets.filter((bet) => !uusUserIds.includes(bet.uid) && choices.includes(bet.choice));
        const uusBets = bets.filter((bet) => uusUserIds.includes(bet.uid) && choices.includes(bet.choice));
        const realBetProcessors = this.settleBetsByGroup(realBets, roundId, settlementResult, this.gameData.totalBets, choices);
        const uusBetProcessors = this.settleBetsByGroup(uusBets, roundId, settlementResult, this.gameData.totalUUSBets, choices);

        return realBetProcessors.concat(uusBetProcessors);
    }

    settleBetsByGroup(bets, roundId, settlementResult, totalBets, choices) {
        const refundChoice = (totalBets[choices[0]] ?? 0) > (totalBets[choices[1]] ?? 0) ? choices[0] : choices[1];
        const refundAmount = Math.abs((totalBets[choices[0]] ?? 0) - (totalBets[choices[1]] ?? 0));
        const refundInfo = {
            choice: refundChoice,
            amount: refundAmount,
        };

        return bets.map((bet) => this.settleBet(bet, roundId, settlementResult, refundInfo));
    }
}
