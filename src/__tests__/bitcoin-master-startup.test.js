import BitcoinMasterStartup from "../bitcoin-master-startup";
import BaseGameStartup from "sc-game-base/src/core/base-game-startup";

jest.mock("sc-game-base/src/core/base-game-startup");
jest.mock("express-minify");
jest.mock("express");

const startup = new BitcoinMasterStartup();

describe("startServer tests", () => {
    it("production env - should use minify and setup static folder correctly", async () => {
        process.env.NODE_ENV = "production";
        const app = {
            use: jest.fn(),
        };
        await startup.startServer(app);

        expect(BaseGameStartup.prototype.startServer).toHaveBeenCalledWith(app);
        expect(app.use).toHaveBeenCalledTimes(2);
    });
    it("not production env - should setup static folder correctly", async () => {
        const app = {
            use: jest.fn(),
        };
        await startup.startServer(app);

        expect(BaseGameStartup.prototype.startServer).toHaveBeenCalledWith(app);
        expect(app.use).toHaveBeenCalledTimes(1);
    });
});

afterEach(() => {
    jest.clearAllMocks();
    delete process.env.NODE_ENV;
});
