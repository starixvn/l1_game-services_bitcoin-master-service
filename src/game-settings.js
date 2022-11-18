export default {
    id: 43,
    name: "BitcoinMaster",
    durations: {
        wholeRound: 119,
        placingBets: 104,
        balancingBetTime: 69,
        lockingBet: 65,
        snapshotOpenPrice: 58,
        waitingResult: 59,
    },
    choices: ["even", "odd", "up", "down"],
    choicesMapper: { even: 1, odd: 2, up: 3, down: 4 },
    hedgeBetGroups: [
        ["even", "odd"],
        ["up", "down"],
    ],
};
