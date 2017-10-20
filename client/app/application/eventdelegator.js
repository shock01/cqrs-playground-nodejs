'use strict';

let delegator = {
    when(/**Object*/instance, /**DomainEvent*/event, ...args) {
        console.log(event);
        let handler = instance[`on${event.type.toLowerCase()}`];
        if (typeof handler === 'function') {
            if(Array.isArray(args)) {
                handler.apply(instance, [event].concat(args));
            } else {
                handler.call(instance, event);
            }
        } else {
            // do some logging here
        }
    }
};

module.exports = delegator;