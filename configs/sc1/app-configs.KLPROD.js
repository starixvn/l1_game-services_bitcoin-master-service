export default {
    hostingPort: 5000,
    apiSettings: {
        enabledApi: true,
        apiUrl: "http://l1-game-api-klprod-service:5000",
        authUrl: "http://l1-auth-api-klprod-service:5000",
        client: {
            id: "game-server",
            secret: "gameserver@20luminet&",
        },
        useAuthenticate: true,
        placeBetTimeout: 4000,
        requestTimeout: 10000, // 10s
        enabledApiLogs: true,
    },
    authenticateSettings: {
        url: "http://l1-auth-api-klprod-service:5000",
        id: "game-services",
        secret: "gameservices@20luminet&",
        requestTimeout: 10000,
        useAuthenticate: true,
        audiences: ["api", "admin-api"],
    },
    userServiceSettings: {
        url: "http://l1-user-service-klprod-service:5000",
    },
    socketOptions: {
        pingInterval: 60 * 1000,
        pingTimeout: 60 * 1000,
        transports: ["websocket"],
        allowUpgrades: false,
    },
    enabledLogs: true,
    database: {
        url: "mongodb://lmn_backend:M7K4ttH%2AtZ3ml%3F%29%7CA%5DjN4%3FLBhwF%266IO%3C@10.146.34.26:39110,10.146.34.27:39110,10.146.34.30:39110,10.146.34.28:39110/?replicaSet=SabaMain&appName=BitcoinMaster",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "http://58fc00e79ab34a3bab04a79038760cb8@sentry-scklprod-ovs.ops-klprod.gamora.prod/8",
        logIdentifier: "bitcoin-master",
        env: "PROD",
    },
    adminSecretKey: "asWDEer4yGdgsdqR4uqmKQZgh",
    chartConfig: {
        socket: "wss://proxy.sabagaming.com/user/bitcoinmaster",
        socketPath: "/bitcoinmaster/socket.io",
        allows: [
            "https://www.sabagaming.com",
            "https://www.gamesaba.com",
            "https://sabagaming.com",
            "https://gamesaba.com",
            "https://m.sabagaming.com",
            "https://m.gamesaba.com",
        ],
    },
    enableMsgpackParser: true,
    balancedBotBettingTime: 70,
};
