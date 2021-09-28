import { Core } from "sc-game-base";

import appConfigs from "./app-configs";
import gameSettings from "./game-settings";
import { getSettlementResult } from "./helpers";
import CryptoProTraderContainerRegistry from "./crypto-pro-trader-container-registry";
import CryptoProTraderGameData from "./game-data";

const run = async () => {
    const gameData = new CryptoProTraderGameData(gameSettings.durations.wholeRound);
    const definition = new Core.GameDefinition(gameSettings, null, getSettlementResult);
    const container = new CryptoProTraderContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp(container);
    
    await app.run();
};

run();
