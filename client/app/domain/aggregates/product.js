'use strict';
const Aggregate = require('../aggregate');
const Event = require('../event');

/**
 * a product has content
 * a product has an internal code
 *
 */
class Product extends Aggregate {

    get type() {
        return 'Product';
    }

    create(/**String*/id) /**Product*/ {
        this.publish(Event.create({
            id,
            type: "productcreated"
        }));
        return this;
    }

    // better to validate the properties of content and dispatch more events when
    // the title eg is not the same, the code is not the same etc
    // parse the content instead....
    content(/**Object*/content) {
        this.publish(Event.create({
            type: "contentChanged",
            content: content
        }))
    }

    onproductcreated(/**ProductCreated*/event) {
        this.id = event.id;
    }

    oncontentchanged(/**ContentChanged*/event) {
        this.content = event.content;
    }

}

module.exports = Product;