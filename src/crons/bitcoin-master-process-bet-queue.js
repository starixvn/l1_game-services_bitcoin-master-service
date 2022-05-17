import { ProcessBetQueue } from "sc-pool-betting-game-base";

export default class BitcoinMasterProcessBetQueue extends ProcessBetQueue {
    async upsertBet(player, roundId, bet, rate) {
        const configs = this.gameData.gameConfigs;
        const existingBetFilter = { uid: player.UID, phien: roundId };
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
            phien: roundId,
            time: new Date(),
            odds: configs.odds,
            [bet.betChoice]: bet.amount,
            totalAmount: bet.amount,
            baseTotalAmount: bet.amount * rate,
            roundId,
        };

        if (player.session) {
            newBet.memberId = player.session.memberId;
            newBet.siteId = player.session.siteId;
            newBet.partnerId = player.session.partnerId;
            newBet.currency = player.session.currencyName;
            newBet.rate = rate;

            newBet.playerId = player.session.memberId;
            newBet.operatorId = player.session.partnerId;
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
