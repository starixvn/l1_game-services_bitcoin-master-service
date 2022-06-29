import { GameCron } from "sc-pool-betting-game-base";
import cron from "cron";
import { getAll, getLatest, uglifyCandleStick } from "../helpers/chart-helper";

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
        exchangeRatesRepository,
        currencyGroupGamesRepository,
        partnerConfigRepository,
        currencyGroupRepository,
        currencyRepository,
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
            exchangeRatesRepository,
            currencyGroupGamesRepository,
            partnerConfigRepository,
            currencyGroupRepository,
            currencyRepository,
        });

        this.cryptoExchangesRepository = cryptoExchangesRepository;
        this.cryptoCandleSticksRepository = cryptoCandleSticksRepository;
        this.betsRepository = betsRepository;
        this.chartClientPublisher = chartClientPublisher;
    }

    async start() {
        const lastRound = await this.roundsRepository
            .findOne({}, "id time result", { sort: { id: -1 } })
            .lean()
            .exec();

        if (lastRound) {
            this.gameData.roundId = lastRound.id + 1;
            await this.processUnsettledBets(lastRound);
        } else {
            this.gameData.roundId = await this.getLastArchiveRound();
            this.initCronJob();
        }

        await this.getSettingForNewRound();
        await this.updateExchangeRates();
    }

    initCronJob() {
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

        job.start();
    }

    async proceed() {
        const { durations } = this.definition;

        await this.updateCryptoExchangeData();

        if (this.gameData.remainingTime === durations.wholeRound) {
            await this.checkGameStatus();
        }

        if (!this.gameData.disabled) {
            this.gameData.remainingTime--;

            const { open, close } = this.gameData.cryptoExchange.runningCandleStick;

            if (this.gameData.remainingTime === this.definition.durations.snapshotOpenPrice) {
                this.runningRoundInfoPublisher.publishToAllUsers({ open });
                this.gameData.open = open;
            }

            this.runningRoundInfoPublisher.publishToAllUsers({ open, close });
        }

        if (this.isStartingTime(this.gameData.remainingTime, durations)) {
            this.resetForNewRound();
            this.bot && (await this.bot.reset());
        }

        if (this.gameData.remainingTime < 0) {
            this.gameData.remainingTime = durations.wholeRound;

            await this.settleGameRoundConsumer.settleRound(this.gameData);
        } else if (this.gameData.remainingTime < durations.placingBets && this.gameData.remainingTime > durations.waitingResult) {
            this.bot && (await this.bot.run());
            this.runningRoundInfoPublisher.publish();
        }

        console.log(this.gameData.open);
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
        await this.getSettingForNewRound();

        if (this.gameData.gameConfigs.exchangeReload) {
            await this.updateExchangeRates();
            await this.gameConfigsRepository.updateOne({ name: configName }, { exchangeReload: false });
            this.gameData.gameConfigs.exchangeReload = false;
        }

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

    async processUnsettledBets(lastRound) {
        const unsettledBet = await this.betsRepository.exists({ thanhtoan: false, phien: lastRound.id + 1 });

        if (unsettledBet) {
            const time = new Date(lastRound.result.time);
            time.setMinutes(time.getMinutes() + 2);

            const settleTime = new Date(time);
            settleTime.setMinutes(settleTime.getMinutes() + 1);
            const now = new Date();

            setTimeout(async () => {
                const { average } = await this.cryptoCandleSticksRepository.findOne({ time }, "average").lean();

                this.gameData.cryptoExchange.runningCandleStick = average;
                this.gameData.open = average.open;

                await this.settleGameRoundConsumer.settleRound();

                await this.updateCryptoExchangeData();
                this.chartClientPublisher.publishToAllClients({ init: getAll(this.gameData.cryptoExchange) });

                this.initCronJob();
            }, Math.max(settleTime.getTime() - now.getTime(), 0));

            await this.updateCryptoExchangeData();
        } else {
            this.initCronJob();
        }
    }

    async updateCryptoExchangeData() {
        const { runningCandleStick } = this.gameData.cryptoExchange;

        this.gameData.cryptoExchange = await this.cryptoExchangesRepository.findOne(null, { _id: false }).lean();

        if (runningCandleStick) {
            const { cryptoExchange } = this.gameData;

            if (runningCandleStick.time.getTime() === cryptoExchange.runningCandleStick.time.getTime()) {
                this.chartClientPublisher.publishLatestCandleToAllClients();
            } else {
                this.chartClientPublisher.publishNewCandleToAllClients();
            }
        }
    }

    async getLastArchiveRound() {
        const { configName } = this.definition;
        const archiveStatus = await this.archiveStatusesRepository.findOne({ name: configName }, "lastArcId").lean().exec();

        return archiveStatus ? archiveStatus.lastArcId["_rounds"] + 1 : 1;
    }
}
