import Chance from "chance";
import { helpers } from "sc-common";
import { Core } from "sc-game-base";

import SpecialSediePlaceBetConsumer from "../crypto-pro-trader-place-bet-consumer";

describe("composeBettingTimeValidationCriteria tests", () => {
    const playerName = "nhanvat01";
    const player = {
        UID: "123",
        profile: {
            name: playerName,
            minBet: 1,
            maxBet: 500,
        },
        session: {
            currency: "US",
        },
    };

    const chance = new Chance();

    const gameData = new Core.GameData();
    gameData.ingame = {
        [playerName]: {
            name: player.profile.name,
            betTracks: {},
            betQueue: [],
        },
    };
    gameData.remainingTime = 20;
    gameData.gameConfigs = {
        enabled: true,
        minbet: 1,
        maxbet: 1000,
        choices_maxbet: {
            choice01: 200,
        },
    };

    const gameDefinition = new Core.GameDefinition({
        choices: ["choice01"],
        durations: {
            wholeRound: 39,
            placingBets: 30,
            lockingBet: 5,
            shakeThePlateDuration: 2,
        },
    });

    it("should return placeBetNextRound notice if game was disabled", () => {
        // arrange
        gameData.gameConfigs.enabled = false;
        const placeBetConsumer = new SpecialSediePlaceBetConsumer(gameDefinition, gameData);

        // act
        var criterions = placeBetConsumer.composeBettingTimeValidationCriteria();

        // assert
        expect(criterions).not.toBeEmpty();
        expect(criterions.filter((x) => x.failure)[0]).toStrictEqual({
            failure: true,
            notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
        });
    });

    it("should return cannotPlaceBet notice if bet comes in settlement time", () => {
        // arrange
        gameData.gameConfigs.enabled = true;
        gameData.remainingTime = chance.integer({
            min: gameDefinition.durations.placingBets,
            max: gameDefinition.durations.placingBets + gameDefinition.durations.shakeThePlateDuration,
        });
        const placeBetConsumer = new SpecialSediePlaceBetConsumer(gameDefinition, gameData);

        // act
        var criterions = placeBetConsumer.composeBettingTimeValidationCriteria();

        // assert
        expect(criterions).not.toBeEmpty();
        expect(criterions.filter((x) => x.failure)[0]).toStrictEqual({
            failure: true,
            notice: { errorCode: helpers.noticeHelper.cannotPlaceBet },
        });
    });

    it("should return placeBetNextRound notice if bet comes in locking bet time", () => {
        // arrange
        gameData.gameConfigs.enabled = true;
        gameData.remainingTime = chance.integer({
            min: 0,
            max: gameDefinition.durations.lockingBet - 1,
        });
        const placeBetConsumer = new SpecialSediePlaceBetConsumer(gameDefinition, gameData);

        // act
        var criterions = placeBetConsumer.composeBettingTimeValidationCriteria();

        // assert
        expect(criterions).not.toBeEmpty();
        expect(criterions.filter((x) => x.failure)[0]).toStrictEqual({
            failure: true,
            notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
        });
    });

    it("should return placeBetNextRound notice if bet comes in shaking plate time", () => {
        // arrange
        gameData.gameConfigs.enabled = true;
        gameData.remainingTime = chance.integer({
            min: gameDefinition.durations.placingBets + gameDefinition.durations.shakeThePlateDuration + 1,
            max: gameDefinition.durations.wholeRound,
        });
        const placeBetConsumer = new SpecialSediePlaceBetConsumer(gameDefinition, gameData);

        // act
        var criterions = placeBetConsumer.composeBettingTimeValidationCriteria();

        // assert
        expect(criterions).not.toBeEmpty();
        expect(criterions.filter((x) => x.failure)[0]).toStrictEqual({
            failure: true,
            notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
        });
    });

    it("should not return any failures if valid", () => {
        // arrange
        gameData.gameConfigs.enabled = true;
        gameData.remainingTime = chance.integer({
            min: gameDefinition.durations.lockingBet + 1,
            max: gameDefinition.durations.placingBets,
        });
        const placeBetConsumer = new SpecialSediePlaceBetConsumer(gameDefinition, gameData);

        // act
        var criterions = placeBetConsumer.composeBettingTimeValidationCriteria();

        // assert
        expect(criterions.filter((x) => x.failure)).toBeEmpty();
    });
});
