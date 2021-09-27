import { asClass, asValue } from "awilix";
import { ContainerRegistry } from "sc-pool-betting-game-base";

import { CryptoProTraderPlaceBetConsumer } from "./consumers";
import { CryptoProTraderGameCron } from "./crons";
import { CryptoProTraderBetLogs, CryptoProTraderBets, CryptoProTraderRounds } from "./models";

export default class CryptoProTraderContainerRegistry extends ContainerRegistry {
    registerModels() {
        super.registerModels();

        this.container.register({
            roundsRepository: asValue(CryptoProTraderRounds),
            betsRepository: asValue(CryptoProTraderBets),
            betLogsRepository: asValue(CryptoProTraderBetLogs),
        });
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            placeBetConsumer: asClass(CryptoProTraderPlaceBetConsumer).singleton(),
        });
    }

    registerCrons() {
        super.registerCrons();

        this.container.register({
            processBetQueue: asClass(CryptoProTraderGameCron).singleton().proxy(),
        });
    }
}
