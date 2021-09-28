export const getSettlementResult = (roundResult) => {
    const { open, close } = roundResult;
    const even = Math.floor(close) % 2 === 0;

    return {
        over: open < close,
        under: open > close,
        odd: !even,
        even,
    };
};
