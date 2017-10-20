'use strict';
const level = require('level');
const sublevel = require('level-sublevel');
const db = level('/var/leveldb/data', { valueEncoding: 'json' });
const sub = sublevel(db);
const products = sub.sublevel('products');

const eventdelegator = require('../eventdelegator');

module.exports = (eventbus, eventstore, logger) => {
    // projection thread to somehow update it......should listen to the update event
    // notification that should wake up readmodel

    let projection = {
        onproductcreated(event, batch) {
            console.log('call on projection', event);
            batch.put(event.id, { title: 'tralalalala' })
            // calls a db.put tralallaa could use a batch
        }
    };

    let sync = (sequenceId) => {

        db.get('sequenceId', (err, value) => {
            var current;
            if (err) {
                current = 0;
            } else {
                current = value;
            }
            console.log('C', current);
            if (current < sequenceId) {
                eventstore.events(current, sequenceId - current).then((events) => {
                    let batch = db.batch();
                    events.forEach(event => eventdelegator.when(projection, event, batch));
                    // update the last sequenceid                
                    console.log('YEAH I HAVE EVENTS', events)
                    batch.put('sequenceId', sequenceId)
                        .write(() => {
                            console.log('done');
                        });
                });
            } else {
                console.log('yeah up2date');
            }
        });
    };

    eventbus.on('update', (event) => {
        console.log('!!!!!!!!!!!!!!!update triggered', event)
        sync(event.sequenceId);

    })

};