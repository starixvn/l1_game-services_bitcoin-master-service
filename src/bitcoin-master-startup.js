import { Core } from "sc-game-base";
import express from "express";
import appConfigs from "./app-configs";
import helmet from "helmet";

export default class BitcoinMasterStartup extends Core.BaseStartup {
    async startServer(app) {
        await super.startServer(app);
        app.get("/chart-config", function (req, res) {
            res.send({ socketInfo: appConfigs.chartConfig });
        });

        if (process.env.NODE_ENV === "production") {
            app.use(
                helmet.contentSecurityPolicy({
                    useDefaults: true,
                    directives: {
                        frameAncestors: appConfigs.chartConfig.allows,
                        connectSrc: ["*"]
                    },
                })
            );
        }
        
        app.use(express.static("public"));
    }
}
