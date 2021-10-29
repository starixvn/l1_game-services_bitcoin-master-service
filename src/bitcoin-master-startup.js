import { Core } from "sc-game-base";
import minify from "express-minify";
import compression from "compression";
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
            app.use(compression());
            app.use(minify({ cache: "public" }));
            app.use(
                helmet.contentSecurityPolicy({
                    useDefaults: true,
                    directives: {
                        frameAncestors: appConfigs.chartConfig.allows,
                    },
                })
            );
        }

        app.use(express.static("public"));
    }
}
