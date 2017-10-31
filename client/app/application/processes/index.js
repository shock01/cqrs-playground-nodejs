module.exports = (eventbus, eventstore, logger) => [
].map(projection => projection(eventbus, eventstore, logger));