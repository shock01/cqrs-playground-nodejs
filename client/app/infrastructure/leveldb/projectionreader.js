'use strict';

class ProjectionReader {

    constructor(/**String*/name, /**Object*/db, /**Logger*/logger) {
        this.name = name;
        this.db = db;
        this.logger = logger;
    }

    byKey(/**String*/key)/**Promise<Object>*/ {

    }

    list()/**Promise<Array.<Object>> */ {

    }
}

module.exports = ProjectionReader;