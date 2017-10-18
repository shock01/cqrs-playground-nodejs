module.exports = (/**CommandBus*/commandbus) => {
    commandbus.on('createproduct', (command) => {
        console.log('Command executes', command);
    });
}