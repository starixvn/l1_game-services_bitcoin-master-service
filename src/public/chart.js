(function () {
    function updateChart(chart, data) {
        chart.setOption({
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "cross",
                },
            },
            legend: {
                data: [""],
            },
            grid: {
                left: "10%",
                right: "10%",
                bottom: "15%",
            },
            xAxis: {
                type: "category",
                data: data.averageCandleSticks.map(x => {
                    const date = new Date(x.time);
                    return `${date.getHours()}:${date.getMinutes()}`;
                }),
                scale: true,
                boundaryGap: false,
                axisLine: { onZero: false },
                splitLine: { show: false },
                min: function (value) {
                    return value.min - 2;
                },
                max: function (value) {
                    return value.max + 2;
                },
            },
            yAxis: {
                scale: true,
                splitArea: {
                    show: true,
                },
            },
            dataZoom: [
                {
                    type: "inside",
                },
            ],
            series: [
                {
                    name: "candles",
                    type: "candlestick",
                    data: data.averageCandleSticks.map(x => [x.open, x.close, x.low, x.high]),
                    itemStyle: {
                        color: "#00da3c",
                        color0: "#ec0000",
                        borderColor: "#008F28",
                        borderColor0: "#8A0000",
                    },
                    markLine: {
                        symbol: ["none", "none"],
                        data: [
                            {
                                name: "min line on close",
                                type: "min",
                                valueDim: "close",
                                yAxis: data.runningCandleStick.close
                            },
                        ],
                        lineStyle: {
                            color: data.runningCandleStick.close > data.runningCandleStick.open ? "#00da3c" : "#ec0000"
                        }
                    },
                },
           /*      {
                    name: "Binance",
                    type: "line",
                    data: calculateMA(5),
                    smooth: true,
                    lineStyle: {
                        opacity: 0.5,
                    },
                },
                {
                    name: "Huobi",
                    type: "line",
                    data: calculateMA(10),
                    smooth: true,
                    lineStyle: {
                        opacity: 0.5,
                    },
                },
                {
                    name: "Mexc",
                    type: "line",
                    data: calculateMA(20),
                    smooth: true,
                    lineStyle: {
                        opacity: 0.5,
                    },
                },
                {
                    name: "Okex",
                    type: "line",
                    data: calculateMA(30),
                    smooth: true,
                    lineStyle: {
                        opacity: 0.5,
                    },
                }, */
            ],
        });
    }
    function init() {
        const socket = io("/user/bitcoinmaster", { path: "/socket.io", transports: ["websocket"] });
        const chart = echarts.init(document.getElementById("main"));
        socket.on("connect", () => {
            const searchParam = new URLSearchParams(window.location.search);
            socket.emit("signinchart", { ss: searchParam.get("ss") });
            socket.on("message", (event) => {
                console.log(event);
            });
            socket.on("BitcoinMaster", (data) => {
                updateChart(chart, data);
            });
            socket.on("disconnect", () => {
                socket.close();
            });
        });
    }

    init();
})();
