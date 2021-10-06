import { GameCron } from "sc-pool-betting-game-base";
import cron from "cron";

export default class BitcoinMasterGameCron extends GameCron {
    constructor({
        definition,
        gameData,
        bot,
        settleGameRoundConsumer,
        gameStatusPublisher,
        runningRoundInfoPublisher,
        logService,
        gameConfigsRepository,
        roundsRepository,
        archiveStatusesRepository,
        notificationRepository,
        cryptoExchangesRepository,
        chartClientPublisher,
    }) {
        super({
            definition,
            gameData,
            bot,
            settleGameRoundConsumer,
            gameStatusPublisher,
            runningRoundInfoPublisher,
            logService,
            gameConfigsRepository,
            roundsRepository,
            archiveStatusesRepository,
            notificationRepository,
        });

        this.cryptoExchangesRepository = cryptoExchangesRepository;
        this.chartClientPublisher = chartClientPublisher;
    }

    async start() {
        const lastRound = await this.roundsRepository
            .findOne({}, "id", { sort: { id: -1 } })
            .lean()
            .exec();
        const job = new cron.CronJob(
            "* * * * * *",
            () => this.proceed().catch(this.logService.logError),
            () => {
                this.logService.logError(
                    `${this.definition.name} unexpectedly stopped at round #${this.gameData.roundId} because some other tasks halt it.`
                );
                job.start();
            }
        );

        if (lastRound) {
            this.gameData.roundId = lastRound.id + 1;
        } else {
            this.gameData.roundId = await this.getLastArchiveRound();
        }

        setTimeout(() => {
            job.start();
        }, (60 - new Date().getSeconds()) * 1000);
    }

    async proceed() {
        await super.proceed();
        await this.updateCryptoExchangeData();

        if (this.gameData.remainingTime === this.definition.durations.snapshotOpenPrice) {
            const { open } = this.gameData.cryptoExchange.runningCandleStick;
            this.runningRoundInfoPublisher.publishToAllUsers({ open });
            this.gameData.open = open;
        }

        this.chartClientPublisher.publishToAllClients(this.gameData.cryptoExchange);
    }

    async updateCryptoExchangeData() {
        this.gameData.cryptoExchange = await this.cryptoExchangesRepository.findOne(null, { _id: false }).lean();
    }
}
