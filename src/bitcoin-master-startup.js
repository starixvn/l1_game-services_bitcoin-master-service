import { Core } from "sc-game-base";
import minify from "express-minify";
import express from "express";
import appConfigs from "./app-configs";

export default class BitcoinMasterStartup extends Core.BaseStartup {
    async startServer(app) {
        await super.startServer(app);
        app.get("/chart-config", function (req, res) {
            res.send({socketInfo: appConfigs.chartConfig});
        });

        if (process.env.NODE_ENV === "production") {
            app.use(minify({ cache: "public" }));
            app.use(express.static("public"));
        } else {
            app.use(express.static("src/public"));
        }
    }
}
