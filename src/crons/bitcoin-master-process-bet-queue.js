import { ProcessBetQueue } from "sc-pool-betting-game-base";

export default class BitcoinMasterProcessBetQueue extends ProcessBetQueue {
    async upsertBet(player, roundId, bet, rate) {
        const configs = this.gameData.gameConfigs;
        const existingBetFilter = { uid: player.UID, roundId };
        const existingBet = await this.betsRepository.findOne(existingBetFilter).exec();
        if (existingBet) {
            await this.updateBet(existingBet, bet, rate);
        } else {
            await this.insertBet(player, bet, roundId, configs, rate);
        }

        if (!this.isTestAccount(player) && (!existingBet || existingBet[bet.betChoice] - bet.amount === 0)) {
            this.gameData.betCount[bet.betChoice] = (this.gameData.betCount[bet.betChoice] ?? 0) + 1;
        }
    }

    async insertBet(player, bet, roundId, configs, rate) {
        const newBet = {
            uid: player.UID,
            name: player.profile.name,
            time: new Date(),
            odds: configs.odds,
            [bet.betChoice]: bet.amount,
            totalAmount: bet.amount,
            baseTotalAmount: bet.amount * rate,
            roundId,
        };

        if (player.session) {
            newBet.siteId = player.session.siteId;
            newBet.currency = player.session.currencyName;
            newBet.rate = rate;

            newBet.playerId = player.session.playerId;
            newBet.operatorId = player.session.operatorId;
        }

        await this.betsRepository.create(newBet);
    }

    async updateBet(existingBet, bet, rate) {
        existingBet[bet.betChoice] += bet.amount;
        existingBet.totalAmount += bet.amount;
        existingBet.baseTotalAmount += bet.amount * rate;

        await existingBet.save();
    }
}
