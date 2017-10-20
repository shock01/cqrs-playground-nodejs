'use strict';
const ProjectionInfo = require('./projectioninfo');
const ProjectionReader = require('./projectionreader');
const ProjectionWriter = require('./projectionwriter');

module.exports = (name, logger) => {
    let db = require('./db');
    return {
        info: new ProjectionInfo(name, db('_sequence'), logger),
        reader: new ProjectionReader(name, db(name), logger),
        writer: new ProjectionWriter(name, db(name), logger)
    };
};