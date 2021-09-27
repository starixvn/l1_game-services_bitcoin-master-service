import { GameData } from "sc-pool-betting-game-base";

export class CryptoProTraderGameData extends GameData {
    constructor(remainingTime) {
        super(remainingTime);
        this.cryptoExchange = null;
    }
}
