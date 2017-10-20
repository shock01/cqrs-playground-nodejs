const restify = require('restify');

const server = restify.createServer({
    name: process.env.SERVICE_NAME,
    version: '1.0.0'
});

let app = async () => {
    /**
     * cqrs
     */
    const logger = require('./application/logger');
    const eventstore = await (require('./infrastructure/mariadb/eventstore')).factory(logger);
    const eventbus = await (require('./application/eventbus')).factory(logger);
    const commandbus = await (require('./application/commandbus')).factory(logger);
    const projections = require('./application/projections');
    const commands = require('./domain/commands');

    /**
     * setup commands 
     */
    commands(commandbus, logger);
    /**
     * setup projections
     */
    projections(eventbus, eventstore, logger);
    /**
     * server 
     */
    server.use(restify.plugins.acceptParser(server.acceptable));
    server.use(restify.plugins.queryParser());
    server.use(restify.plugins.bodyParser());

    server.get('/echo/:name', (req, res, next) => {
        res.send(req.params);
        return next();
    });

}

app()
    .then(() => {
        const client = require('./infrastructure/mariadb/client');
        client.query('SHOW DATABASES', (err, rows) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.dir(rows);
        });
        server.listen(process.env.PORT, () => {
            console.log('%s listening at %s', server.name, server.url);
        });
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });


