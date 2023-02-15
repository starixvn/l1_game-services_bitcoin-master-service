export default {
    hostingPort: 5000,
    apiSettings: {
        enabledApi: true,
        apiUrl: "http://l1_game_api_local_1:5000",
        authUrl: "http://l1_auth_api_local_1:5000",
        client: {
            id: "game-server",
            secret: "gameserver@20luminet&",
        },
        useAuthenticate: true,
        requestTimeout: 10000,
        placeBetTimeout: 4000,
        enabledApiLogs: true,
    },
    authenticateSettings: {
        url: "http://l1_auth_api_local_1:5000",
        id: "game-services",
        secret: "gameservices@20luminet&",
        requestTimeout: 10000,
        useAuthenticate: true,
        audiences: ["api", "admin-api"],
    },
    userServiceSettings: {
        url: "http://l1_user_service_local_1:5000",
    },
    socketOptions: {
        pingInterval: 60 * 1000,
        pingTimeout: 60 * 1000,
        transports: ["websocket"],
        allowUpgrades: false,
    },
    enabledLogs: true,
    database: {
        url: "mongodb://lmn_backend:LmnBackend@10.10.50.14:17101/?replicaSet=L1pLocal&appName=BitcoinMaster",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "https://13f39b8359404ed5aec23655e64ccf78@sentry.lumigame.com/2",
        logIdentifier: "bitcoin-master",
        env: "LOCAL-1",
    },
    adminSecretKey: "asWDEerfOIdgsdqRTFabvmgh",
    chartConfig: {
        socket: "wss://l1-proxy1.lumigame.com/user/bitcoinmaster",
        socketPath: "/bitcoinmaster/socket.io",
        allows: ["http://localhost:7456", "http://localhost:7000", "https://l1-games1.lumigame.com", "https://l1-m1.lumigame.com"],
    },
    enableMsgpackParser: false,
    balancedBotBettingTime: 70,
};
