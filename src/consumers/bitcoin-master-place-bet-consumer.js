import { Core } from "sc-game-base";
import notices from "sc-pool-betting-game-base/src/constants/notices";

export default class BitcoinMasterPlaceBetConsumer extends Core.BaseEventConsumers.PlaceBetConsumer {
    balanceChoiceMapper = {
        odd: "even",
        even: "odd",
        up: "down",
        down: "up",
    };

    composeValidationCriteria(player, betChoice, amount, freeBet, roundId) {
        const baseCriteria = super.composeValidationCriteria(player, betChoice, amount, freeBet, roundId);

        const { betTracks } = this.gameData.ingame[player.profile.name] || { betTracks: {} };
        const criteria = [
            {
                failure: betTracks[this.balanceChoiceMapper[betChoice]] > 0,
                notice: this.getNoticeObj(notices.oneChoiceAllowed),
            },
        ];

        return baseCriteria.concat(criteria);
    }
}
