import GameData from "../game-data";

export default class ChartClientPublisher {
    /**
     * @param {string} gameName
     * @param {GameData} gameData
     */
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
