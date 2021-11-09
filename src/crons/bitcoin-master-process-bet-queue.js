import { ProcessBetQueue } from "sc-pool-betting-game-base";

export default class BitcoinMasterProcessBetQueue extends ProcessBetQueue {
    async upsertBet(player, roundId, bet) {
        const configs = this.gameData.gameConfigs;
        const existingBetFilter = { uid: player.UID, phien: roundId };
        const existingBet = await this.betsRepository.findOne(existingBetFilter).exec();
        if (existingBet) {
            await this.updateBet(existingBet, bet);
        } else {
            await this.insertBet(player, bet, roundId, configs);
        }

        if (!this.isUUSAccount(player) && (!existingBet || existingBet[bet.betChoice] - bet.amount === 0)) {
            this.gameData.betCount[bet.betChoice] = (this.gameData.betCount[bet.betChoice] ?? 0) + 1;
        }
    }

    async insertBet(player, bet, roundId, configs) {
        const newBet = {
            uid: player.UID,
            name: player.profile.name,
            phien: roundId,
            time: new Date(),
            odds: configs.odds,
            [bet.betChoice]: bet.amount,
            totalAmount: bet.amount,
        };

        if (player.session) {
            newBet.memberId = player.session.memberId;
            newBet.siteId = player.session.siteId;
        }

        await this.betsRepository.create(newBet);
    }

    async updateBet(existingBet, bet) {
        existingBet[bet.betChoice] += bet.amount;
        existingBet.totalAmount += bet.amount;
        await existingBet.save();
    }
}
