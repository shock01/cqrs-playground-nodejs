'use strict';

let delegator = {
    when(/**Object*/instance, /**DomainEvent*/event) {
        let handler = instance[`on${event.type.toLowerCase()}`];
        if (typeof handler === 'function') {
            handler.call(instance, event);
        } else {
            // do some logging here
        }
    }
};

module.exports = delegator;