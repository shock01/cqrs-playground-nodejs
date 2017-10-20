'use strict';

class ProjectionWriter {
    constructor(/**String*/name, /**Object*/db, /**Logger*/logger) {
        this.name = name;
        this.db = db;
        this.logger = logger;
    }

    start() {
        this.batch = this.db.batch()
    }

    end()/**Promise<Void>*/ {
        return new Promise((resolve, reject) => {
            this.batch.write((err) => {
                if(err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    tryDelete(/**String*/key)/**Void */ {
        this.batch.del(key);
    }
    addOrUpdate(/**String*/key, /**Object*/value)/**Void */ {
        this.batch.put(key, value);
    }

}

module.exports = ProjectionWriter;