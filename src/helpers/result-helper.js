export const getSettlementResult = (roundResult) => {
    const { open, close } = roundResult;
    const even = Math.floor(close) % 2 === 0;

    return {
        up: open < close,
        down: open > close,
        odd: !even,
        even,
    };
};
