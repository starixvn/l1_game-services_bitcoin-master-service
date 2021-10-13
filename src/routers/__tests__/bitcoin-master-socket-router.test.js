import { Core } from "sc-game-base";
import gameSettings from "../../game-settings";
import GameData from "../../bitcoin-master-game-data";
import BitcoinMasterSocketRouter from "../bitcoin-master-socket-router";
import UserDisconnectConsumer from "sc-game-base/src/core/event-consumers/user-disconnect-consumer";

jest.mock("sc-game-base/src/core/event-consumers/user-disconnect-consumer");

const gameData = new GameData(gameSettings.durations.wholeRound);
gameData.roundId = 1;
const definition = new Core.GameDefinition(gameSettings);
const userDisconnectConsumer = new UserDisconnectConsumer();
const socketClient = {
    id: "socket-id",
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
};
const socketRouter = new BitcoinMasterSocketRouter({
    definition,
    gameData,
    userDisconnectConsumer,
});

describe("init tests", () => {
    it("should binds socket events", () => {
        socketRouter.init(socketClient);

        expect(socketClient.on).toHaveBeenCalledTimes(7);
    });
});
describe("handleDisconnect tests", () => {
    it("should delete socketclient from gameData", () => {
        // arrange
        gameData.chartClients = {
            "socket-id": socketClient,
        };
        socketRouter.handleDisconnect();

        // assert
        expect(gameData.chartClients["socket-id"]).toBeUndefined();
    });
});

describe("handleSignInChart tests", () => {
    it("ss is valid, add to chartClient", () => {
        gameData.realPlayers = {
            [socketClient.id]: {
                socketClient,
                session: {
                    sessionId: 1,
                },
            },
        };
        socketRouter.handleSignInChart({ ss: 1 });

        expect(gameData.chartClients["socket-id"]).toEqual(socketClient);
    });

    it("ss is invalid, call emit and disconnect", () => {
        gameData.realPlayers = {
            [socketClient.id]: {
                socketClient,
                session: {
                    sessionId: 1,
                },
            },
        };
        socketRouter.handleSignInChart({ ss: 2 });

        expect(gameData.chartClients).toBeEmpty();
        expect(socketClient.disconnect).toBeCalledWith(true)
        expect(socketClient.emit).toBeCalledWith("message", { unauthorized: true })
    });
});

afterEach(() => {
    gameData.realPlayers = {};
    gameData.chartClients = {};
    jest.clearAllMocks();
});
