import gameSettings from "../../../src/game-settings";
import GameData from "../../../src/bitcoin-master-game-data";
import ChartClientPublisher from "../../../src/event-publishers/chart-client-publisher";

const gameData = new GameData(gameSettings.durations.wholeRound);
gameData.roundId = 1;

const publisher = new ChartClientPublisher("bitcoinmaster", gameData);

describe("publishToAllClients tests", () => {
    it("should send chart data to all clients", () => {
        const socketClient = {
            emit: jest.fn(),
        };
        gameData.chartClients = {
            1: socketClient,
        };
        publisher.publishToAllClients({ runningCandleStick: { open: 100, close: 150 } });

        expect(socketClient.emit).toHaveBeenCalled();
    });
});
