import { Core } from "sc-game-base";
import BitcoinMasterGameData from "../../../src/bitcoin-master-game-data";
import gameSettings from "../../../src/game-settings";

import BitcoinMasterPlaceBetConsumer from "../../../src/consumers/bitcoin-master-place-bet-consumer";

describe("composeValidationCriteria tests", () => {
    const playerName = "nhanvat01";
    const player = {
        UID: "123",
        profile: {
            name: playerName,
            minBet: 1,
            maxBet: 3000,
        },
        session: {
            currency: "US",
            currencyGroupId: "g1",
        },
    };

    const definition = new Core.GameDefinition(gameSettings, null);
    const gameConfigs = {
        odds: { odd: 1.98, even: 1.98, up: 1.98, down: 1.98 },
    };
    const gameData = new BitcoinMasterGameData(119);
    gameData.gameConfigs = gameConfigs;
    gameData.roundId = 1;
    gameData.currencyGroupGames = [
        {
            groupId: "g1",
            minBet: 1,
            maxBet: 2000,
            maxBetPerChoices: {
                odd: 2000,
                even: 2000,
                up: 2000,
                down: 2000,
            },
        },
    ];
    const consumer = new BitcoinMasterPlaceBetConsumer(definition, gameData);

    it("criteons has true item if user bet the opposite pair choice", () => {
        // arrange
        gameData.ingame = {
            [playerName]: {
                name: player.profile.name,
                betTracks: { odd: 100 },
                betQueue: [],
            },
        };

        // act
        var criterions = consumer.composeValidationCriteria(player, "even", 100, false, 1);

        // assert
        expect(criterions).not.toBeEmpty();
        expect(criterions.some((x) => x.failure)).toBeTrue();
    });
});
