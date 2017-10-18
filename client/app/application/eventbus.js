const EventEmitter = require('events');

const SINGLETON_KEY = Symbol("eventbus");
const QUEUE = 'events';
const LOGGER = 'eventbus';

class EventBus extends EventEmitter {

    constructor(channel, logger) {
        super();
        this.channel = channel;
        this.logger = logger;
    }
    init() {
        this.channel.consume(QUEUE, (msg) => {
            if (msg === null) {
                return;
            }
            try {
                /**
                 * @type {EventSource}
                 */
                let eventSource = JSON.parse(msg.content.toString());
                this.emit(eventSource.eventType, eventSource.data);
            } catch (e) {
                this.logger.warn(`[${LOGGER}] cannot parse msg : ${e}`);
            }
            this.logger.info(`[${LOGGER}] received : ${msg.content}`);
        }, { noAck: false });
    }

    dispatch(/**EventSource*/eventSource) /**CommandBus*/ {
        this.channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(eventSource)));
        return this;
    }

    static async factory(logger)/**CommandBus*/ {
        let instance = global[SINGLETON_KEY];
        if (!instance) {
            let queue = require('../infrastructure/rabbitmq/queue'),
                channel = await require('../infrastructure/rabbitmq/channel')(),
                commandQueue = await queue(QUEUE, channel),
                instance = new EventBus(channel, logger);
            instance.init();
            global[SINGLETON_KEY] = instance;
        }
        return instance;
    }

}

module.exports = EventBus;