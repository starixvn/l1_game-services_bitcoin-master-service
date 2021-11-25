import { Core } from "sc-game-base";

export default class BitcoinMasterInGameConsumer extends Core.BaseEventConsumers.InGameConsumer {
    constructor(definition, gameData, roundQuery, publisher, getBalance, userInfosRepository, runningRoundInfoPublisher) {
        super(definition, gameData, roundQuery, publisher, getBalance, userInfosRepository);
        this.runningRoundInfoPublisher = runningRoundInfoPublisher;
    }

    async consume(realPlayer) {
        await super.consume(realPlayer);

        const { remainingTime, gameConfigs, open } = this.gameData;
        const { durations } = this.definition;

        if (gameConfigs?.enabled) {
            if (remainingTime <= durations.snapshotOpenPrice) {
                this.publisher.publishToUser(realPlayer.UID, { open });
            }

            if (remainingTime <= durations.waitingResult) {
                this.runningRoundInfoPublisher.publishBetPercentage();
            }
        }
    }
}
