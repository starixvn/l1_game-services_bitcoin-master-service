import { Core } from "sc-game-base";
import appConfigs from "../app-configs";
import express from "express";
import helmet from "helmet";

export default class BitcoinMasterHttpRouter extends Core.Routers.HttpRouter {
    init(app) {
        super.init(app);

        app.get("/chart-config", function (req, res) {
            res.send({ socketInfo: appConfigs.chartConfig });
        });

        if (process.env.NODE_ENV === "production") {
            app.use(
                helmet.contentSecurityPolicy({
                    useDefaults: true,
                    directives: {
                        frameAncestors: appConfigs.chartConfig.allows,
                        connectSrc: ["*"],
                    },
                })
            );
        }

        app.use(express.static("public"));
    }
}
