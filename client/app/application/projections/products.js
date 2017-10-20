'use strict';

const eventdelegator = require('../eventdelegator');

module.exports = (eventbus, eventstore, logger) => {

    let name = 'products',
        { info, reader, writer } = require('../../infrastructure/leveldb/projection')(name, logger);

    let products = {
        onproductcreated(event) {
            console.log('call on projection', event);
            writer.addOrUpdate(event.id, { title: 'tralalalala' });
        }
    };

    let sync = async (sequenceId) => {
        try {
            let details = await info.details(),
                current = details.sequenceId;
            if (current < sequenceId) {
                let events = await eventstore.events(current, sequenceId - current);
                writer.start();
                events.forEach(event => eventdelegator.when(products, event.data));
                await writer.end();
                await info.updated(sequenceId);
            } else {
                logger.info(`projection: ${name} is up2date`);
            }
        } catch (e) {
            logger.error(e);
        }
    };

    eventbus.on('update', (event) => {
        sync(event.sequenceId);
    });
};