(function () {
    var percentFormatter = new Intl.NumberFormat("en-US", {
        style: "percent",
        signDisplay: "auto",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    var numberFormatter = new Intl.NumberFormat("en-US", {
        style: "decimal",
        signDisplay: "auto",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const bullishColor = "#0ecb81";
    const bearlishColor = "#f6465d";

    const defaultChartOption = {
        backgroundColor: "rgba(16, 12, 42, 0.2)",
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "cross",
                label: {
                    fontSize: 14,
                    color: "blue",
                    formatter: function (params) {
                        if (params.axisDimension === "x") {
                            return echarts.format.formatTime("hh:mm", params.value);
                        }

                        if (params.axisDimension === "y") {
                            return numberFormatter.format(params.value);
                        }
                    },
                },
            },
            position: [40, 0],
            formatter: function (params) {
                const { data: item } = params[0];
                const sub = item[2] - item[1];
                const textColor = sub > 0 ? bullishColor : bearlishColor;

                const open = `<strong>O:</strong> <span style="color:${textColor}">${numberFormatter.format(item[1])}</span>`;
                const close = `<strong>C:</strong> <span style="color:${textColor}">${numberFormatter.format(item[2])}</span>`;
                const low = `<strong>L:</strong> <span style="color:${textColor}">${numberFormatter.format(item[3])}</span>`;
                const high = `<strong>H:</strong> <span style="color:${textColor}">${numberFormatter.format(item[4])}</span>`;
                const icon = sub > 0 ? "▲" : "▼";
                const percentage = `<span style="color:${textColor}">${icon}${numberFormatter.format(
                    Math.abs(sub)
                )} (${percentFormatter.format(Math.abs(sub) / item[1])})</span>`;

                return `${open} ${high} ${low} ${close} ${percentage}`;
            },
        },
        legend: {
            icon: "circle",
            data: ["", "Bitcoin Master", "Binance", "Huobi", "Okex", "Mexc"],
            selected: {
                Binance: false,
                Huobi: false,
                Mexc: false,
                Okex: false,
            },
            bottom: 0,
            textStyle: {
                fontSize: 20,
            },
            itemGap: 20,
            itemHeight: 20,
        },
        grid: {
            left: 20,
            top: 50,
            right: 80,
            bottom: 60,
        },
        yAxis: {
            scale: true,
            position: "right",
            axisLabel: {
                fontSize: 14,
            },
        },
        xAxis: {
            type: "time",
            minInterval: 5,
            splitLine: { show: false },
            max: function (value) {
                return value.max + 60000;
            },
            axisLabel: {
                fontSize: 14,
                formatter: "{HH}:{mm}",
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
                sum += data[j].c;
            }
            result.push([times[i], sum / 6]);
        }
        return result;
    }

    function updateChart(chart, data) {
        const times = data.averageCandleSticks.map((x) => x.t);
        const dynamicOption = {
            dataset: {
                source: data.averageCandleSticks.map((x) => [x.t, x.o, x.c, x.l, x.h]),
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
                                yAxis: data.runningCandleStick.c,
                            },
                        ],
                        label: {
                            backgroundColor: data.runningCandleStick.c > data.runningCandleStick.o ? bullishColor : bearlishColor,
                            color: "white",
                            padding: [5, 5, 5, 5],
                            fontSize: 14,
                            formatter: function (params) {
                                return numberFormatter.format(params.value);
                            },
                        },
                        lineStyle: {
                            color: data.runningCandleStick.c > data.runningCandleStick.o ? bullishColor : bearlishColor,
                        },
                    },
                },
                {
                    name: "Bitcoin Master",
                    type: "line",
                    data: calculateMA6(data.averageCandleSticks, times),
                    smooth: true,
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
                    name: "Okex",
                    type: "line",
                    data: calculateMA6(data.okex, times),
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
