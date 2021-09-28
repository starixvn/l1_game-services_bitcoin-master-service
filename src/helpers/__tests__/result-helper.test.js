import { getSettlementResult } from "../result-helper";

describe("getSettlementResult tests", () => {
    const testCases = [
        [
            { open: 100, close: 100 },
            { odd: false, even: true, over: false, under: false },
        ],
        [
            { open: 45, close: 48.555 },
            { odd: false, even: true, over: true, under: false },
        ],
    ];
    it.each(testCases)("should return correct settlement", (result, expectedSettlementResult) => {
        // act
        var settlementResult = getSettlementResult(result);

        // assert
        expect(settlementResult).toEqual(expectedSettlementResult);
    });
});
