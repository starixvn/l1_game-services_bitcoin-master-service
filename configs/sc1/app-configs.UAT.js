export default {
    hostingPort: 5000,
    apiSettings: {
        enabledApi: true,
        apiUrl: "http://l1_game_api_uat:5000",
        authUrl: "http://l1_auth_api_uat:5000",
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
        url: "http://l1_auth_api_uat:5000",
        id: "game-services",
        secret: "gameservices@20luminet&",
        requestTimeout: 10000,
        useAuthenticate: true,
        audiences: ["api", "admin-api"],
    },
    userServiceSettings: {
        url: "http://l1_user_service_uat:5000",
    },
    socketOptions: {
        pingInterval: 60 * 1000,
        pingTimeout: 60 * 1000,
        transports: ["websocket"],
        allowUpgrades: false,
    },
    enabledLogs: true,
    database: {
        url: "mongodb://lmn_backend:LmnBackend%4022027@10.99.99.53:39120,10.99.99.54:39120,10.99.99.188:39120,10.99.99.187:39120/?replicaSet=SabaUAT&appName=BitcoinMaster",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "http://52368c4019044019885440599c180bda@10.2.190.51:9009/24",
        logIdentifier: "bitcoin-master",
        env: "UAT",
    },
    adminSecretKey: "asWDEerfOIdgsdqRTFabvmgh",
    chartConfig: {
        socket: "wss://l1uatproxy.sgamesuat.com/user/bitcoinmaster",
        socketPath: "/uat/bitcoinmaster/socket.io",
        allows: ["*"],
    },
    enableMsgpackParser: true,
    balancedBotBettingTime: 70,
};
