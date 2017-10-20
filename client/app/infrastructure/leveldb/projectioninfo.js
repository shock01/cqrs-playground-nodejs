'use strict';

class ProjectionInfo {

    constructor(/**String*/name, /**Object*/db, /**Logger*/logger) {
        this.name = name;
        this.db = db;
        this.logger = logger;
    }
    

    details() /**Promise<SequenceInfo>*/ {
        return new Promise((resolve) => {
            this.db._sequence.get(this.name, (err, result) => {
                if (err) {
                    this.logger.warn(`cannot fetch sequenceinfo for: ${this.name}, ${err}`);
                    return resolve({ sequenceId: 0 })
                } else {
                    resolve(result);
                }
            })

        });
    }

    updated(/**Number*/sequenceId)/**Promise<Object>*/ {
        this.logger.info(`update sequenceinfo for: ${this.name}, sequenceId:${sequenceId}`);
        return new Promise((resolve, reject) => {
            this.db._sequence.put(this.name, {
                time: Date.now(),
                sequenceId
            }, (err, result) => {
                if (err) {
                    this.logger.warn(`cannot update sequenceinfo for: ${this.name}, ${err}`);
                    return reject(err);
                }
                resolve(result);
            });
        });
    }
}

module.exports = ProjectionInfo;