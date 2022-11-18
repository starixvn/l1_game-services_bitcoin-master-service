import { getSettlementResult } from "../../../src/helpers/result-helper";

describe("getSettlementResult tests", () => {
    const testCases = [
        [
            { open: 100, close: 100 },
            { odd: false, even: true, up: false, down: false },
        ],
        [
            { open: 45, close: 48.555 },
            { odd: false, even: true, up: true, down: false },
        ],
    ];
    it.each(testCases)("should return correct settlement", (result, expectedSettlementResult) => {
        // act
        var settlementResult = getSettlementResult(result);

        // assert
        expect(settlementResult).toEqual(expectedSettlementResult);
    });
});
