import { ProcessBetQueue } from "sc-pool-betting-game-base";

export default class BitcoinMasterProcessBetQueue extends ProcessBetQueue {
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
