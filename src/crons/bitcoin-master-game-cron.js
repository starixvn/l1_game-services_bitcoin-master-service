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
            await this.processUnsettledBets(lastRound);
        } else {
            this.gameData.roundId = await this.getLastArchiveRound();
        }

        job.start();
    }


    async proceed() {
        await super.proceed();
        if (!this.gameData.disabled) {
            await this.updateCryptoExchangeData();
            const { open, close } = this.gameData.cryptoExchange.runningCandleStick;

            if (this.gameData.remainingTime === this.definition.durations.snapshotOpenPrice) {
                this.runningRoundInfoPublisher.publishToAllUsers({ open });
                this.gameData.open = open;
            }

            this.runningRoundInfoPublisher.publishToAllUsers({ close });
            this.chartClientPublisher.publishToAllClients(this.gameData.cryptoExchange);
        }

        this.firstStart = false;
        console.log(`${new Date().getSeconds()}-${this.gameData.remainingTime}`);
    }

    async checkGameStatus() {
        const { configName, durations } = this.definition;
        const configs = await this.gameConfigsRepository.findOne({ name: configName }).lean().exec();
        const previouslyDisabled = this.gameData.disabled;
        const configuredlyDisabled = !configs || !configs.enabled;

        if (previouslyDisabled) {
            if (this.gameData.delayStartTime > 0) {
                this.gameData.delayStartTime--;
            } else if (!configuredlyDisabled) {
                this.gameData.delayStartTime = 61 - new Date().getSeconds();
            }
        }

        this.gameData.umMessages =
            (await this.notificationRepository.findOne({ gameName: configName, displayKind: 2 }, "messages").lean().exec())?.messages ?? {};

        this.gameData.gameConfigs = configs ?? {};
        this.gameData.disabled = configuredlyDisabled || this.gameData.delayStartTime > 0;

        debugger;
        if (this.gameData.disabled) {
            this.gameData.remainingTime = durations.wholeRound;
            this.gameStatusPublisher.publishDisableGameStatus();
            await this.gameConfigsRepository.updateOne({ name: configName }, { disabledround: this.gameData.roundId });
        } else if (previouslyDisabled) {
            this.gameStatusPublisher.publishEnablingGameStatus();
        } else {
            this.gameStatusPublisher.publishStartGame();
        }
    }

    async updateCryptoExchangeData() {
        this.gameData.cryptoExchange = await this.cryptoExchangesRepository.findOne(null, { _id: false }).lean();
    }

    async processUnsettledBets(lastRound) {
        const unsettledBet = await this.betsRepository.exists({ thanhtoan: false, phien: lastRound.id + 1 });

        if (unsettledBet) {
            const time = new Date(lastRound.result.time);
            time.setMinutes(time.getMinutes() + 2);

            const { average } = await this.cryptoCandleSticksRepository.findOne({ time }, "average", { sort: { id: -1 } }).lean();

            this.gameData.cryptoExchange = {
                runningCandleStick: average,
            };

            this.gameData.open = average.open;

            await this.settleGameRoundConsumer.settleRound();
        }
    }
}
