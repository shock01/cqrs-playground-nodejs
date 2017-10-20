const EventEmitter = require('events');

const QUEUE = 'commands';
const LOGGER = 'commandbus';
/**
 * @typedef {Object} CommandMessage
 * @property {String} type
 * @property {Number} timestamp
 * @property {String} command
 * @property {Object} data
 */

class CommandBus extends EventEmitter {
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
                 * @type {CommandMessage}
                 */
                let command = JSON.parse(msg.content.toString());
                this.emit(command.type.toLowerCase(), command.data);
            } catch (e) {
                this.logger.warn(`[${LOGGER}] cannot parse msg : ${e}`);
            }
            this.logger.info(`[${LOGGER}] received ${msg.content}`);
        }, { noAck: false });
    }

    dispatch(/**String*/type,/**Object*/data) /**CommandBus*/ {
        let msg = {
            timestamp: Date.now(),
            type,
            data
        };
        this.channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(msg)));
        return this;
    }

    static async factory(logger)/**CommandBus*/ {
        let queue = require('../infrastructure/rabbitmq/queue');
        let channel = await require('../infrastructure/rabbitmq/channel')();
        await queue(QUEUE, channel);
        let instance = new CommandBus(channel, logger);
        instance.init();
        return instance;
    }

}

module.exports = CommandBus;