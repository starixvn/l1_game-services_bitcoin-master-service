import { asClass, asValue } from "awilix";
import { ContainerRegistry } from "sc-pool-betting-game-base";

import BitcoinMasterPlaceBetConsumer from "./consumers/place-bet-consumer";
import BitcoinMasterSettleGameRoundConsumer from "./consumers/settle-game-round-consumer";
import BitcoinMasterGameCron from "./crons/game-cron";
import BitcoinMasterProcessBetQueue from "./crons/process-bet-queue";
import { BitcoinMasterBetLogs, BitcoinMasterBets, BitcoinMasterRounds, CryptoExchanges } from "./models";

export default class BitcoinMasterContainerRegistry extends ContainerRegistry {
    registerModels() {
        super.registerModels();

        this.container.register({
            roundsRepository: asValue(BitcoinMasterRounds),
            betsRepository: asValue(BitcoinMasterBets),
            betLogsRepository: asValue(BitcoinMasterBetLogs),
            cryptoExchangesRepository: asValue(CryptoExchanges),
        });
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            settleGameRoundConsumer: asClass(BitcoinMasterSettleGameRoundConsumer).singleton().proxy(),
            placeBetConsumer: asClass(BitcoinMasterPlaceBetConsumer).singleton(),
        });
    }

    registerCrons() {
        super.registerCrons();

        this.container.register({
            gameCron: asClass(BitcoinMasterGameCron).singleton().proxy(),
            processBetQueue: asClass(BitcoinMasterProcessBetQueue).singleton().proxy(),
        });
    }
}
