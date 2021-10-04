(function () {
    const socket = io("/user/bitcoinmaster", { path: "/socket.io", transports: ["websocket"] });
    socket.on("connect", () => {
        const searchParam = new URLSearchParams(window.location.search);
        socket.emit("signinchart", { ss: searchParam.get("ss") });
        socket.on("message", (event) => {
            console.log(event);
        });
        socket.on("BitcoinMaster", (event) => {
            console.log(event);
        });
        socket.on("disconnect", () => {
            socket.close();
        });
    });
})();
