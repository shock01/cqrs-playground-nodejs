module.exports = (eventbus, eventstore, logger) => [
    require('./products')
].map(projection => projection(eventbus, eventstore, logger));