'use strict';
const delegator = require('../application/eventdelegator');
/**
 * @abstract
 */
class Aggregate {
    constructor(/**String*/id) {
        this.version = 0;
        this.id = id;
        /**
         *
         * @type {Array.<DomainEvent>}
         */
        this.uncommittedEvents = [];
    }

    get type() {
        throw 'not implemented';
    }

    publish(/**DomainEvent*/ event) {
        this.uncommittedEvents.push(event);
        this.apply(event);
    }

    /**
     * @private
     */
    apply(/**DomainEvent*/event) {
        this.version++;
        try {
            delegator.when(this, event);
        } catch (e) {
            this.version--;
            throw e;
        }
    }
}

module.exports = Aggregate;