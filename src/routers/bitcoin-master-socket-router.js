import { SocketRouter } from "sc-pool-betting-game-base";

export default class BitcoinMasterSocketRouter extends SocketRouter {
    init(socketClient) {
        super.init(socketClient);

        socketClient.on("signinchart", this.handleSignInChart.bind(this));
    }

    async handleSignInChart(payload) {
        try {
            const { ss } = payload;

            if (Object.values(this.gameData.realPlayers).some((x) => x.session.sessionId === ss)) {
                this.gameData.chartClients[this.socketClient.id] = this.socketClient;
            } else {
                this.socketClient.emit("message", { unauthorized: true });
                this.socketClient.disconnect(true);
            }
        } catch (error) {
            this.logService.logError(error);
        }
    }

    handleDisconnect() {
        super.handleDisconnect();
        delete this.gameData.chartClients[this.socketClient.id];
    }
}
