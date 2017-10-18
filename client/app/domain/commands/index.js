module.exports = (/**CommandBus*/commandbus) => {
    [
        require('./createproduct')
    ].forEach(item => item(commandbus));
};
