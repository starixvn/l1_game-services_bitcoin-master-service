import { Core } from "sc-game-base";

export default class BitcoinMasterInGameConsumer extends Core.BaseEventConsumers.InGameConsumer {
    async consume(realPlayer) {
        await super.consume(realPlayer);

        const { remainingTime, gameConfigs, open } = this.gameData;
        const { durations } = this.definition;

        if (gameConfigs?.enabled && remainingTime <= durations.snapshotOpenPrice) {
            this.publisher.publishToUser(realPlayer.UID, { open });
        }
    }
}
