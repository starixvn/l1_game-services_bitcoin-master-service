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
        cryptoCandleSticksRepository,
        betsRepository,
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
        this.cryptoCandleSticksRepository = cryptoCandleSticksRepository;
        this.betsRepository = betsRepository;
        this.chartClientPublisher = chartClientPublisher;
    }

    async start() {
        const lastRound = await this.roundsRepository
            .findOne({}, "id", { sort: { id: -1 } })
            .lean()
            .exec();

        this.job = new cron.CronJob(
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
            await this.processUnsettledBets(lastRound);
        } else {
            this.gameData.roundId = await this.getLastArchiveRound();
        }

        this.startJob();
    }

    startJob() {
        setTimeout(() => {
            this.job.start();
        }, (60 - new Date().getSeconds()) * 1000);
    }

    async proceed() {
        await super.proceed();
        if (!this.gameData.disabled) {
            await this.updateCryptoExchangeData();

            if (this.gameData.remainingTime === this.definition.durations.snapshotOpenPrice) {
                const { open } = this.gameData.cryptoExchange.runningCandleStick;
                this.runningRoundInfoPublisher.publishToAllUsers({ open });
                this.gameData.open = open;
            }

            this.chartClientPublisher.publishToAllClients(this.gameData.cryptoExchange);
        }
    }

    async checkGameStatus() {
        const { disabled } = this.gameData.disabled;
        await super.checkGameStatus();

        if (disabled && !this.gameData.disabled) {
            this.job.stop();
            this.startJob();
        }
    }

    async updateCryptoExchangeData() {
        this.gameData.cryptoExchange = await this.cryptoExchangesRepository.findOne(null, { _id: false }).lean();
    }

    async processUnsettledBets(lastRound) {
        const unsettledBet = await this.betsRepository.exists({ thanhtoan: false, phien: lastRound.id + 1 }).lean();

        if (unsettledBet) {
            const time = new Date(lastRound.result.time);
            time.setMinutes(time.getMinutes() + 2);

            const runningCandleStick = await this.cryptoCandleSticksRepository.findOne({ time }).lean();

            this.gameData.cryptoExchange = {
                runningCandleStick,
            };

            this.gameData.open = runningCandleStick.open;

            await this.settleGameRoundConsumer.settleRound();
        }
    }
}
