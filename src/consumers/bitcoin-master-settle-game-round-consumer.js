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
            const uusUsers = await this.userInfosRepository.find({ currency: "UUS" }, "id").lean().exec();
            const uusUserIds = uusUsers.map((user) => user.id);

            await Promise.all(this.settleUpDown(uusUserIds, bets, roundId, settlementResult));
            await Promise.all(this.settleOddEven(uusUserIds, bets, roundId, settlementResult));

            const settledBets = await this.querySettledBets(roundId);

            await Promise.all(
                settledBets.map(async (bet) => {
                    const betResult = this.calculateBetResult(bet, bets.filter(x => x.phien === bet.phien && x.uid === bet.uid));

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

    
    calculateBetResult(bet, betLogs) {
        const betResult = betLogs.reduce(
            (result, betLog) => {
                if (betLog.win) {
                    result.totalWin += betLog.betwin + betLog.amount;
                    result.winningByChoices[betLog.choice] += betLog.betwin + betLog.amount;   
                    //result.netWin += betLog.betwin;
                } else {
                     result.totalWin += betLog.refund;
                     result.winningByChoices[betLog.choice] += betLog.refund;
                     result.totalLost += betLog.amount - betLog.refund;
                }

                return result;
            },
            {
                totalBetAmount: bet.totalAmount,
                totalWin: 0,
                totalLost: 0,
                winningByChoices: {},
            }
        );
    
        return betResult;
    }


    settleUpDown(uusUserIds, bets, roundId, settlementResult) {
        const choices = ["up", "down"];

        if (settlementResult.up || settlementResult.down) {
            const realBets = bets.filter((bet) => !uusUserIds.includes(bet.uid) && choices.includes(bet.choice));
            const uusBets = bets.filter((bet) => uusUserIds.includes(bet.uid) && choices.includes(bet.choice));
            const realBetProcessors = this.settleBetsByGroup(realBets, roundId, settlementResult, this.gameData.totalBets, choices);
            const uusBetProcessors = this.settleBetsByGroup(uusBets, roundId, settlementResult, this.gameData.totalUUSBets, choices);

            return realBetProcessors.concat(uusBetProcessors);
        } else {
            const upDownBets = bets.filter((bet) => choices.includes(bet.choice));

            return upDownBets.map((bet) => this.settleBet(bet, roundId, settlementResult, { choice: bet.choice, amount: bet.amount }));
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
