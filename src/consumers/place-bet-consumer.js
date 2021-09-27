import { PlaceBetConsumer } from "sc-pool-betting-game-base";
import notices from "sc-pool-betting-game-base/src/constants/notices";

export default class CryptoProTraderPlaceBetConsumer extends PlaceBetConsumer {
    balanceChoiceMapper = {
        odd: "even",
        even: "odd",
        over: "under",
        under: "over",
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
