import { Core } from "sc-game-base";

import appConfigs from "./app-configs";
import gameSettings from "./game-settings";
import { getSettlementResult } from "./helpers";
import BitcoinMasterContainerRegistry from "./bitcoin-master-container-registry";
import BitcoinMasterGameData from "./game-data";

const run = async () => {
    const gameData = new BitcoinMasterGameData(gameSettings.durations.wholeRound);
    const definition = new Core.GameDefinition(gameSettings, null, getSettlementResult);
    const container = new BitcoinMasterContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp(container);
    
    await app.run();
};

run();
