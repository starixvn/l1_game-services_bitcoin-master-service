import { Bot } from "sc-pool-betting-game-base";

export default class BitcoinMasterBot extends Bot {
    constructor(definition, gameData, publisher, userInfosRepository, betsRepository, betLogsRepository) {
        super(definition, gameData, publisher, userInfosRepository, betsRepository, betLogsRepository);

        this.ratioOfUnroundTicket = 50;

        this.betChoiceRatio = {
            mainOpts: 60,
            subOpts: 40,
        };

        this.mainOpts = ["up", "down"];
        this.subOpts = ["even", "odd"];
    }

    getBetChoicesToBalance() {
        const totalBotBet = this.getAllBetAmount();

        const betChoiceRatios = [
            {
                group: this.mainOpts,
                underBetRatio: (this.getTotalAmountOnChoiceGroup(this.mainOpts) * 100) / totalBotBet < this.betChoiceRatio.mainOpts,
            },
            {
                group: this.subOpts,
                underBetRatio: (this.getTotalAmountOnChoiceGroup(this.subOpts) * 100) / totalBotBet < this.betChoiceRatio.subOpts,
            },
        ];

        return betChoiceRatios.find((x) => x.underBetRatio)?.group ?? betChoiceRatios[0].group;
    }

    getAllBetAmount() {
        let total = 0;
        this.definition.choices.forEach((choice) => (total += this.gameData.totalBets[choice] ?? 0));

        return total;
    }

    getTotalAmountOnChoiceGroup(choices) {
        let total = 0;
        choices.forEach((choice) => (total += this.gameData.totalBets[choice] ?? 0));

        return total;
    }

    async upsertBet(bot, choice, betAmount) {
        const { roundId } = this.gameData;

        const update = { [choice]: betAmount, totalAmount: betAmount, baseTotalAmount: betAmount * this.botRate };

        const create = { uid: bot.id, roundId, time: new Date(), rate: this.botRate, roundId };

        await this.betsRepository.updateOne(
            { uid: bot.id, roundId },
            { $inc: update, $setOnInsert: create },
            { upsert: true, setDefaultsOnInsert: true }
        );
    }
}
