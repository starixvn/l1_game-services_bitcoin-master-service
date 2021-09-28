import { asClass, asValue } from "awilix";
import { ContainerRegistry } from "sc-pool-betting-game-base";

import CryptoProTraderPlaceBetConsumer from "./consumers/place-bet-consumer";
import CryptoProTraderSettleGameRoundConsumer from "./consumers/settle-game-round-consumer";
import CryptoProTraderGameCron from "./crons/game-cron";
import CryptoProTraderProcessBetQueue from "./crons/process-bet-queue";
import { CryptoProTraderBetLogs, CryptoProTraderBets, CryptoProTraderRounds, CryptoExchanges } from "./models";

export default class CryptoProTraderContainerRegistry extends ContainerRegistry {
    registerModels() {
        super.registerModels();

        this.container.register({
            roundsRepository: asValue(CryptoProTraderRounds),
            betsRepository: asValue(CryptoProTraderBets),
            betLogsRepository: asValue(CryptoProTraderBetLogs),
            cryptoExchangesRepository: asValue(CryptoExchanges),
        });
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            settleGameRoundConsumer: asClass(CryptoProTraderSettleGameRoundConsumer).singleton().proxy(),
            placeBetConsumer: asClass(CryptoProTraderPlaceBetConsumer).singleton(),
        });
    }

    registerCrons() {
        super.registerCrons();

        this.container.register({
            gameCron: asClass(CryptoProTraderGameCron).singleton().proxy(),
            processBetQueue: asClass(CryptoProTraderProcessBetQueue).singleton().proxy(),
        });
    }
}
