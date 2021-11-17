import { SocketRouter } from "sc-pool-betting-game-base";
import { uglifyCandleStick } from "../helpers/chart-helper";

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
                this.socketClient.emit(this.definition.name, { init: this.getChartData() });
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

    getChartData() {
        const { cryptoExchange } = this.gameData;

        return {
            a: cryptoExchange.averageCandleSticks.map((x) => uglifyCandleStick(x)),
            b: cryptoExchange.binance.map((x) => uglifyCandleStick(x)),
            h: cryptoExchange.huobi.map((x) => uglifyCandleStick(x)),
            m: cryptoExchange.mexc.map((x) => uglifyCandleStick(x)),
            o: cryptoExchange.okex.map((x) => uglifyCandleStick(x)),
        };
    }
}
