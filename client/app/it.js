const Product = require('./domain/aggregates/product')
const id = require('./domain/id');
const logger = require('./application/logger');
let a = async () => {

    let eventstore = await require('./infrastructure/mariadb/eventstore').factory(logger);

    let aggregate = new Product().create(id());

    let start = Date.now();
    await eventstore.save(aggregate);
    console.log('done insert', Date.now() - start, aggregate.id);

    let result = await eventstore.eventsForStream(aggregate.id, 0, 1000);

    let sequenceId = await eventstore.sequenceId();
    console.log('------------------', sequenceId);

    let instance = await eventstore.byId(aggregate.id, Product);
    console.log('byId', instance);
    try {
        console.log('GOT IT', result);

        return result;
    } catch (e) {
        console.error(e);
    } finally {
        console.log('truncate');
        require('./infrastructure/mariadb/client').query('TRUNCATE events');
        console.log('done');
        process.exit(0)
    }
};

a().then(values => {
    console.log('done!!!');
    console.log(values);

}).catch(e => console.error(e))