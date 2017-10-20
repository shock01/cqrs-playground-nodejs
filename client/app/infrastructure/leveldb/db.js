'use strict';
const level = require('level');
const sublevel = require('level-sublevel');

var db;
module.exports = (name) => {
    if(!db) {
        db =  level('/var/leveldb/data', { valueEncoding: 'json' });
    }
    if(!db[name]) {
        // partitions by key
        db[name] = sublevel(db).sublevel(name);
    } 
    return db;
};