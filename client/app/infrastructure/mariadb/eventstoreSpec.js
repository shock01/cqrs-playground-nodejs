const EventStore = require('./eventstore');
const EventBus = require('../application/eventbus')
const mariasql = require('mariasql');

const expect = require('chai').expect;

const mock = require('sinon').mock;

describe('eventStore ', () => {

    let /**EventStore*/subject;
    let client;
    let /**EventBus*/eventbus;

    beforeEach(() => {
        let client_ = new mariasql();
        let eventbus_ = new EventBus();
        client = mock(client_);
        eventbus = mock(eventbus_);
        subject = new eventstore(client_, eventbus_);
    });

    describe('eventsForStream', () => {
        it('should be true', () => {
            expect(1).to.equal(2);
        });
    });
});