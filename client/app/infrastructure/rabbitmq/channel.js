const amqp = require('amqplib');

let connection = () => {
    return amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`)
        .then(conn => conn.createChannel())
        .then(conn => {
            process.once('SIGINT', conn.close.bind(conn));
            return conn;
        });
};

module.exports = connection;