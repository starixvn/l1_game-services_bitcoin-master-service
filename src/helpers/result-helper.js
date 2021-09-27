export const getSettlementResult = (roundResult) => {
    const { open, close } = roundResult;
    return {
        over: open < close,
        under: open > close,
        odd: close % 2 !== 0,
        even: close % 2 === 0,
    };
};
