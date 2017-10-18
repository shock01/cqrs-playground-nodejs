const amqp = require('amqplib');

let connection = () => {
    return amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`).then(conn => conn.createChannel());
}

module.exports = connection;