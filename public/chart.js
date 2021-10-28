(function () {
    var numberFormatter = new Intl.NumberFormat("en-US", { style: "decimal", signDisplay: "always", maximumFractionDigits: 2 });
    const bullishColor = "#0ecb81";
    const bearlishColor = "#f6465d";

    const defaultChartOption = {
        backgroundColor: "rgba(16, 12, 42, 0.5)",
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "cross",
            },
            position: [40, 0],
            formatter: function (params, ticket, callback) {
                const { data: item } = params[0];
                const sub = item[2] - item[1];
                const number = sub > 0 ? item[2] : item[1];
                const textColor = sub > 0 ? bullishColor : bearlishColor;

                const open = `O: <span style="color:${textColor}">${item[1]}</span>`;
                const close = `C: <span style="color:${textColor}">${item[2]}</span>`;
                const low = `L: <span style="color:${textColor}">${item[3]}</span>`;
                const high = `H: <span style="color:${textColor}">${item[4]}</span>`;
                const percentage = `<span style="color:${textColor}">${numberFormatter.format(sub)}(${numberFormatter.format(
                    (sub * 100) / number
                )}%)</span>`;

                return `${open} ${high} ${low} ${close} ${percentage}`;
            },
        },
        legend: {
            data: ["", "Binance", "Huobi", "Mexc", "Okex"],
            selected: {
                Binance: false,
                Huobi: false,
                Mexc: false,
                Okex: false,
            },
            bottom: 0,
        },
        grid: {
            left: 50,
            top: 50,
            right: 70,
            bottom: 60
        },
        yAxis: {
            scale: true,
            position: "right",
        },
        xAxis: {
            type: "time",
            minInterval: 5,
            splitLine: { show: false },
            max: function (value) {
                return value.max + 60000;
            },
        },
    };

    function calculateMA6(data, times) {
        const result = [];
        for (let i = 0; i < 5; i++) {
            result.push([times[i], ""]);
        }

        for (let i = 5; i < data.length; i++) {
            let sum = 0;
            for (var j = i - 5; j <= i; j++) {
                sum += data[j].close;
            }
            result.push([times[i], sum / 6]);
        }
        return result;
    }

    function updateChart(chart, data) {
        const times = data.averageCandleSticks.map((x) => x.time);
        const dynamicOption = {
            dataset: {
                source: data.averageCandleSticks.map((x) => [x.time, x.open, x.close, x.low, x.high]),
            },
            series: [
                {
                    dimensions: ["date", "open", "close", "highest", "lowest"],
                    name: "candles",
                    type: "candlestick",
                    barMinWidth: "80%",
                    itemStyle: {
                        color: bullishColor,
                        color0: bearlishColor,
                        borderColor: "#008F28",
                        borderColor0: "#8A0000",
                    },
                    markLine: {
                        symbol: ["none"],
                        data: [
                            {
                                name: "min line on close",
                                yAxis: data.runningCandleStick.close,
                            },
                        ],
                        label: {
                            backgroundColor: data.runningCandleStick.close > data.runningCandleStick.open ? bullishColor : bearlishColor,
                            color: data.runningCandleStick.close > data.runningCandleStick.open ? "black" : "white",
                            padding: [5, 5, 5, 5],
                        },
                        lineStyle: {
                            color: data.runningCandleStick.close > data.runningCandleStick.open ? bullishColor : bearlishColor,
                        },
                    },
                },
                {
                    name: "Binance",
                    type: "line",
                    data: calculateMA6(data.binance, times),
                    smooth: true,
                    lineStyle: {
                        opacity: 0.5,
                        type: "dotted",
                    },
                },
                {
                    name: "Huobi",
                    type: "line",
                    data: calculateMA6(data.huobi, times),
                    smooth: true,
                    lineStyle: {
                        opacity: 0.5,
                        type: "dotted",
                    },
                },
                {
                    name: "Mexc",
                    type: "line",
                    data: calculateMA6(data.mexc, times),
                    smooth: true,
                    lineStyle: {
                        opacity: 0.5,
                        type: "dotted",
                    },
                },
                {
                    name: "Okex",
                    type: "line",
                    data: calculateMA6(data.okex, times),
                    smooth: true,
                    lineStyle: {
                        opacity: 0.5,
                        type: "dotted",
                    },
                },
            ],
        };

        if (chart.getOption()) {
            chart.setOption({ ...dynamicOption });
        } else {
            chart.setOption({ ...defaultChartOption, ...dynamicOption });
        }
    }

    function initChart(socketInfo) {
        const socket = io(socketInfo.socket, {
            path: socketInfo.socketPath,
            transports: ["websocket"],
        });

        const chart = echarts.init(document.getElementById("main"), "dark");
        socket.on("connect", () => {
            const searchParam = new URLSearchParams(window.location.search);
            socket.emit("signinchart", { ss: searchParam.get("ss") });

            socket.on("BitcoinMaster", (data) => {
                updateChart(chart, data);
            });
            socket.on("disconnect", () => {
                socket.close();
            });
        });
    }

    function init() {
        const request = new XMLHttpRequest();
        request.open("get", "chart-config");
        request.send();

        request.onloadend = function (event) {
            const res = JSON.parse(event.target.response);
            initChart(res.socketInfo);
        };
    }

    init();
})();
