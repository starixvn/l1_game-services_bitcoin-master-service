import { SettleGameRoundConsumer } from "sc-pool-betting-game-base";

export default class BitcoinMasterSettleGameRoundConsumer extends SettleGameRoundConsumer {
    generateResult() {
        const resultFromAdmin = this.gameData.settlementResultFromAdmin;

        const { runningCandleStick } = this.gameData.cryptoExchange;

        const result = {
            time: runningCandleStick.time,
            open: this.gameData.open,
            close: runningCandleStick.close,
        };

        return this.gameData.roundId === resultFromAdmin.roundId
            ? {
                  time: result.time,
                  ...resultFromAdmin.result,
              }
            : result;
    }

    async settleBets({ result, settlementResult, roundId, time }) {
        const bets = await this.queryBets(roundId);

        if (bets && bets.length) {
            const testCurrencies = await this.currencyRepository.find({ isTest: true }, "name partnerId").lean().exec();

            await Promise.all(this.settleUpDown(testCurrencies, bets, roundId, settlementResult));
            await Promise.all(this.settleOddEven(testCurrencies, bets, roundId, settlementResult));

            const settledBets = await this.querySettledBets(roundId);

            await Promise.all(
                settledBets.map(async (bet) => {
                    const betResult = this.calculateBetResult(
                        bet,
                        bets.filter((x) => x.roundId === bet.roundId && x.uid === bet.uid)
                    );

                    await this.callEndGame(bet, roundId, time, betResult);
                    this.captureBetResult(bet.uid, betResult);

                    if (bet.playerId) {
                        this.userBetResultPublisher.publish(bet.uid, betResult);
                    }
                })
            );
        }

        this.roundResultPublisher.publishRoundResult(this.collectRoundResult(result, settlementResult, roundId));
    }

    calculateBetResult(bet, betLogs) {
        return betLogs.reduce(
            (result, betLog) => {
                if (betLog.win) {
                    result.totalWin += betLog.betwin + betLog.amount;
                    result.winningByChoices[betLog.choice] = (result.winningByChoices[betLog.choice] ?? 0) + betLog.betwin + betLog.amount;
                    result.netWin += betLog.betwin;
                } else {
                    result.totalWin += betLog.refund;
                    result.winningByChoices[betLog.choice] = (result.winningByChoices[betLog.choice] ?? 0) + betLog.refund;
                }

                result.totalLost += betLog.amount - betLog.refund;

                return result;
            },
            {
                totalBetAmount: bet.totalAmount,
                totalWin: 0,
                totalLost: 0,
                netWin: 0,
                winningByChoices: {},
            }
        );
    }

    settleUpDown(testCurrencies, bets, roundId, settlementResult) {
        const choices = ["up", "down"];

        if (settlementResult.up || settlementResult.down) {
            return this.settleBetsByChoices(testCurrencies, bets, roundId, settlementResult, choices);
        }

        const upDownBets = bets.filter((bet) => choices.includes(bet.choice));
        return upDownBets.map((bet) => this.settleBet(bet, roundId, settlementResult, { choice: bet.choice, amount: bet.baseAmount }));
    }

    settleOddEven(testCurrencies, bets, roundId, settlementResult) {
        const choices = ["odd", "even"];

        return this.settleBetsByChoices(testCurrencies, bets, roundId, settlementResult, choices);
    }

    settleBetsByChoices(testCurrencies, bets, roundId, settlementResult, choices) {
        const realBets = bets.filter(
            (bet) =>
                !testCurrencies.some((currency) => currency.name === bet.currency && currency.partnerId === bet.operatorId) &&
                choices.includes(bet.choice)
        );
        const uusBets = bets.filter(
            (bet) =>
                testCurrencies.some((currency) => currency.name === bet.currency && currency.partnerId === bet.operatorId) &&
                choices.includes(bet.choice)
        );

        const realBetProcessors = this.settleBetsByGroup(realBets, roundId, settlementResult, this.gameData.totalBets, choices);
        const uusBetProcessors = this.settleBetsByGroup(uusBets, roundId, settlementResult, this.gameData.totalTestBets, choices);

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
