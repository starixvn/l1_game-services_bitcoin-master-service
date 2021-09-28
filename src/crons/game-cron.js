import { GameCron } from "sc-pool-betting-game-base";
import cron from "cron";

export default class CryptoProTraderGameCron extends GameCron {
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

        console.log(new Date().getSeconds());

        
        setTimeout(() => {
            job.start();
            console.log("started!!!");
        }, (60 - new Date().getSeconds()) * 1000);
    }

    async proceed() {
        await super.proceed();
        await this.updateCryptoExchangeData();
        console.log(this.gameData.remainingTime);
    }

    async updateCryptoExchangeData() {
        this.gameData.cryptoExchange = await this.cryptoExchangesRepository.findOne().lean();
    }
}
