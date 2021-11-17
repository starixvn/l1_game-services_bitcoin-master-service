import { GameCron } from "sc-pool-betting-game-base";
import cron from "cron";
import { uglifyCandleStick } from "../helpers/chart-helper";

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
            .findOne({}, "id time result", { sort: { id: -1 } })
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

                this.gameData.cryptoExchange = {
                    runningCandleStick: average,
                };

                this.gameData.open = average.open;

                await this.settleGameRoundConsumer.settleRound();
            }, Math.max(settleTime.getTime() - now.getTime(), 0));
        }
    }

    async updateCryptoExchangeData() {
        const { runningCandleStick } = this.gameData.cryptoExchange;

        this.gameData.cryptoExchange = await this.cryptoExchangesRepository.findOne(null, { _id: false }).lean();

        if (runningCandleStick) {
            const { cryptoExchange } = this.gameData;

            if (runningCandleStick.time.getTime() === cryptoExchange.runningCandleStick.time.getTime()) {
                this.publishChartDataToClients("u");
            } else {
                this.publishChartDataToClients("n");
            }
        }
    }

    publishChartDataToClients(action) {
        this.chartClientPublisher.publishToAllClients({ [action]: this.getChartData() });
    }

    getChartData() {
        const { averageCandleSticks, binance, huobi, mexc, okex } = this.gameData.cryptoExchange;

        return {
            a: uglifyCandleStick(averageCandleSticks[averageCandleSticks.length - 1]),
            b: uglifyCandleStick(binance[binance.length - 1]),
            h: uglifyCandleStick(huobi[huobi.length - 1]),
            m: uglifyCandleStick(mexc[mexc.length - 1]),
            o: uglifyCandleStick(okex[okex.length - 1]),
        };
    }
}
