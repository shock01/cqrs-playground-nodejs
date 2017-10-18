module.exports = (name, channel) => {
    return channel.assertQueue(name, { durable: false });
};