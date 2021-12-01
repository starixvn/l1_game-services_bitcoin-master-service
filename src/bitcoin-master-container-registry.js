import { asClass, asValue } from "awilix";
import { ContainerRegistry } from "sc-pool-betting-game-base";
import BitcoinMasterInGameConsumer from "./consumers/bitcoin-master-ingame-consumer";

import BitcoinMasterPlaceBetConsumer from "./consumers/bitcoin-master-place-bet-consumer";
import BitcoinMasterSettleGameRoundConsumer from "./consumers/bitcoin-master-settle-game-round-consumer";
import BitcoinMasterBot from "./crons/bitcoin-master-bot";
import BitcoinMasterGameCron from "./crons/bitcoin-master-game-cron";
import BitcoinMasterProcessBetQueue from "./crons/bitcoin-master-process-bet-queue";
import BitcoinMasterRunningRoundInfoPublisher from "./event-publishers/bitcoin-master-running-round-info-publisher";
import ChartClientPublisher from "./event-publishers/chart-client-publisher";
import { BitcoinMasterBetLogs, BitcoinMasterBets, BitcoinMasterRounds, CryptoExchanges, CryptoCandleSticks } from "./models";
import BitcoinMasterHistoryQuery from "./query-apis/bitcoin-master-history-query";
import BitcoinMasterSocketRouter from "./routers/bitcoin-master-socket-router";
import BitcoinMasterHttpRouter from "./routers/bitcoin-master-http-router";

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
            inGameConsumer: asClass(BitcoinMasterInGameConsumer).singleton(),
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
            httpRouter: asClass(BitcoinMasterHttpRouter),
        });
    }

    registerPublishers() {
        super.registerPublishers();

        this.container.register({
            runningRoundInfoPublisher: asClass(BitcoinMasterRunningRoundInfoPublisher).singleton(),
            chartClientPublisher: asClass(ChartClientPublisher).singleton(),
        });
    }

    registerApis() {
        super.registerApis();

        this.container.register({
            historyQuery: asClass(BitcoinMasterHistoryQuery).singleton(),
        });
    }
}
