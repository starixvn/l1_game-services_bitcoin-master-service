import { asClass, asValue } from "awilix";
import { ContainerRegistry } from "sc-pool-betting-game-base";

import BitcoinMasterPlaceBetConsumer from "./consumers/place-bet-consumer";
import BitcoinMasterSettleGameRoundConsumer from "./consumers/settle-game-round-consumer";
import BitcoinMasterBot from "./crons/bot";
import BitcoinMasterGameCron from "./crons/game-cron";
import BitcoinMasterProcessBetQueue from "./crons/process-bet-queue";
import ChartClientPublisher from "./event-publishers/chart-client-publisher";
import { BitcoinMasterBetLogs, BitcoinMasterBets, BitcoinMasterRounds, CryptoExchanges } from "./models";
import BitcoinMasterSocketRouter from "./routers/socket-router";

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
            bot: asClass(BitcoinMasterBot).singleton(),
            gameCron: asClass(BitcoinMasterGameCron).singleton().proxy(),
            processBetQueue: asClass(BitcoinMasterProcessBetQueue).singleton().proxy(),
        });
    }

    registerRouters() {
        super.registerRouters();

        this.container.register({
            socketRouter: asClass(BitcoinMasterSocketRouter).proxy(),
        });
    }
    
    registerPublishers() {
        super.registerPublishers();

        this.container.register({
            chartClientPublisher: asClass(ChartClientPublisher).singleton(),
        });
    }

}
