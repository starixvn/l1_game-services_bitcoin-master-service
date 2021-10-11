export default class ChartClientPublisher {
    constructor(gameName, gameData) {
        this.gameName = gameName;
        this.gameData = gameData;
    }

    publishToAllClients(payload) {
        const socketClients = Object.values(this.gameData.chartClients);

        socketClients.forEach((socket) => {
            socket && socket.emit(this.gameName, payload);
        });
    }
}
