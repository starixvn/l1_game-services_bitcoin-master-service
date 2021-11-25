import { Core } from "sc-game-base";

export default class BitcoinMasterHistoryQuery extends Core.QueryApis.HistoryQuery {
    getBetLogDetails(player, roundId) {
        return this.betLogsRepository
            .find(
                { phien: roundId, uid: player.UID },
                { _id: false, time: true, choice: true, amount: true, win: true, refund: true, betwin: true },
                { sort: { _id: -1 } }
            )
            .lean()
            .exec();
    }
}
