import { generateResult, getSettlementResult } from "../result-helper";

describe("getSettlementResult tests", () => {
    it("should return odd if results have ONE red", () => {
        // arrange
        const roundResult = { red1: true, red2: false, red3: false, red4: false };
        const expected = {
            odd: true,
            even: false,
        };

        // act
        var result = getSettlementResult(roundResult);

        // assert
        expect(result).toStrictEqual(expected);
    });

    it("should return even if results have TWO reds", () => {
        // arrange
        const roundResult = { red1: true, red2: true, red3: false, red4: false };
        const expected = {
            odd: false,
            even: true,
        };

        // act
        var result = getSettlementResult(roundResult);

        // assert
        expect(result).toStrictEqual(expected);
    });

    it("should return odd if results have THREE reds", () => {
        // arrange
        const roundResult = { red1: true, red2: true, red3: true, red4: false };
        const expected = {
            odd: true,
            even: false,
        };

        // act
        var result = getSettlementResult(roundResult);

        // assert
        expect(result).toStrictEqual(expected);
    });

    it("should return even if results have FOUR reds", () => {
        // arrange
        const roundResult = { red1: true, red2: true, red3: true, red4: true };
        const expected = {
            odd: false,
            even: true,
        };

        // act
        var result = getSettlementResult(roundResult);

        // assert
        expect(result).toStrictEqual(expected);
    });

    it("should return even and white4 if results have NO reds", () => {
        // arrange
        const roundResult = { red1: false, red2: false, red3: false, red4: false };
        const expected = {
            odd: false,
            even: true,
        };

        // act
        var result = getSettlementResult(roundResult);

        // assert
        expect(result).toStrictEqual(expected);
    });
});

describe("generateResult tests", () => {
    it("should return enough results", () => {
        // act
        var result = generateResult();

        // assert
        expect(Object.keys(result).length).toBe(4);
    });
});
