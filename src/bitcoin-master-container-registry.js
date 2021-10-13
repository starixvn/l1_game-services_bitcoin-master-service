import { asClass, asValue } from "awilix";
import { ContainerRegistry } from "sc-pool-betting-game-base";

import BitcoinMasterPlaceBetConsumer from "./consumers/bitcoin-master-place-bet-consumer";
import BitcoinMasterSettleGameRoundConsumer from "./consumers/bitcoin-master-settle-game-round-consumer";
import BitcoinMasterBot from "./crons/bitcoin-master-bot";
import BitcoinMasterGameCron from "./crons/bitcoin-master-game-cron";
import BitcoinMasterProcessBetQueue from "./crons/bitcoin-master-process-bet-queue";
import BitcoinMasterRunningRoundInfoPublisher from "./event-publishers/bitcoin-master-running-round-info-publisher";
import ChartClientPublisher from "./event-publishers/chart-client-publisher";
import { BitcoinMasterBetLogs, BitcoinMasterBets, BitcoinMasterRounds, CryptoExchanges } from "./models";
import CryptoCandleSticks from "./models/crypto-candlestick";
import BitcoinMasterSocketRouter from "./routers/bitcoin-master-socket-router";

export default class BitcoinMasterContainerRegistry extends ContainerRegistry {
    registerModels() {
        super.registerModels();

        this.container.register({
            roundsRepository: asValue(BitcoinMasterRounds),
            betsRepository: asValue(BitcoinMasterBets),
            betLogsRepository: asValue(BitcoinMasterBetLogs),
            cryptoExchangesRepository: asValue(CryptoExchanges),
            cryptoCandleSticksRepository: asValue(CryptoCandleSticks),
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
            runningRoundInfoPublisher: asClass(BitcoinMasterRunningRoundInfoPublisher).singleton(),
            chartClientPublisher: asClass(ChartClientPublisher).singleton(),
        });
    }
}
