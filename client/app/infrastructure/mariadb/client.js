let client = new (require('mariasql'))({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    db: process.env.DB_NAME,
    multiStatements: true
});

module.exports = client;