'use strict';
/**
 * queries
 */
const SELECT_SQL = "SELECT * FROM events WHERE aggregateId=? AND aggregateType=? ORDER BY version";
const INSERT_SQL = "INSERT INTO events (aggregateId, aggregateType, eventType, eventDate, version, data) VALUES (:aggregateId, :aggregateType, :eventType, :eventDate, :version, :data)";
const SELECT_EVENTS_SQL = "SELECT * FROM events ORDER BY sequence ASC LIMIT ? OFFSET ?";

const fields = `
aggregateId,
aggregateType,
eventType,
eventDate,
version,
data,
sequence
`;

class EventStore {

    constructor(client, /**EventBus*/eventbus) {
        this.client = client;
        this.eventbus = eventbus;
    }

    /**
     * @private
     * @param {*} query 
     */
    entries(query) {
        return new Promise((resolve, reject) => {
            let entries = [];
            query
                .on('result', result => {
                    result
                        .on('data', row => {
                            let { aggregateId, aggregateType, eventType, eventDate, version, data, sequence } = row;
                            let entry/**EventSource*/ = {
                                aggregateId,
                                aggregateType,
                                sequence: parseInt(sequence, 10),
                                eventDate: new Date(eventDate),
                                eventType,
                                version: parseInt(version, 10),
                                data: JSON.parse(data)
                            };
                            Object.freeze(entry);
                            entries.push(entry);
                        })
                        .on('end', () => resolve(entries));
                })
                .on('error', e => reject(e));
        });
    }

    async eventsForStream(/**String*/ aggregateId, /**Number*/ version, /**Number*/ limit)/**Promise.<Array.<EventSource>>*/ {
        return this.entries(this.client.query(`
            SELECT  
                ${fields}
            FROM events 
            WHERE 
                aggregateId='${aggregateId}'
                AND version >= ${version} 
            ORDER BY version ASC 
            LIMIT ${limit};`
        ));
    }

    async events(/**Number*/offset, /**Number*/limit)/**Promise.<Array.<EventSource>>*/ {
        return this.entries(this.client.query(`
        SELECT  
            ${fields}
        FROM events 
        ORDER BY version ASC 
        LIMIT ${offset},${limit};`
        ));
    }

    /**
     * returns the last sequence if of the store
     */
    async sequenceId() /**Promise.<Number>*/ {
        let rows = await this.query(`
        SELECT 
            MAX(sequence) 
        FROM events`);
        return parseInt(rows[0]);
    }

    async verifyVersion(/**Aggregate*/aggregate, /**Number*/nextVersion) {
        let rows = await this.query(`
        SELECT 
            MAX(version) 
        FROM events 
        WHERE aggregateId='${aggregate.id}' AND aggregateType='${aggregate.type}';
        `);
        let version = parseInt(rows[0]);
        if (version >= nextVersion) {
            return reject(new Error(`Version conflict: ${aggregate.type}:${aggregate.id} ( ${version} >= ${nextVersion})`));
        }
    }

    async save(/**Aggregate*/aggregate) /**Promise.<void>*/ {
        let { type, id, /**Array.<DomainEvent>*/uncommittedEvents } = aggregate,
            version = aggregate.version - uncommittedEvents.length,
            next = version;

        this.verifyVersion(aggregate, version + 1);
        // @todo extract method
        let values = uncommittedEvents
            .map(/**DomainEvent*/event => {
                next++;
                return `('${id}', '${type}', '${event.type}', '${EventStore.UTC()}', ${next}, '${JSON.stringify(event)}')`;
            })
            .join(',');
        let query = `
            START TRANSACTION;
            INSERT INTO events (aggregateId, aggregateType, eventType, eventDate, version, data) 
            VALUES 
                ${values};
            COMMIT;    
            `;
        aggregate.uncommittedEvents = [];
        let rows = await this.query(query)
        let events = await this.eventsForStream(id, version + 1, uncommittedEvents.length);
        events.forEach(event => this.eventbus.dispatch(event));
    }

    query(/**String*/sql) {
        return new Promise((resolve, reject) => {
            this.client.query(sql, null, { useArray: true }, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            })
        });
    }

    async byId(/**String*/ aggregateId, /**Aggregate*/ cls)/**Promise.<Aggregate>*/ {
        let events = await this.entries(this.client.query(`
        SELECT  
            ${fields}
        FROM events 
        WHERE 
            aggregateId='${aggregateId}'
        ORDER BY version ASC
        `));
        // requires empty constructor
        let instance = new cls();
        events.forEach(event => instance.apply(event.data));
        return instance;
    }

    static async factory()/**EventStore*/ {
        let eventbus = await require('../../application/eventbus').factory();
        let instance = new EventStore(require('./client'), eventbus);
        return instance;
    }

    static UTC()/**String*/ {
        let starttime = new Date();
        // Get the iso time (GMT 0 == UTC 0)
        let isotime = new Date((new Date(starttime)).toISOString());
        // getTime() is the unix time value, in milliseconds.
        // getTimezoneOffset() is UTC time and local time in minutes.
        // 60000 = 60*1000 converts getTimezoneOffset() from minutes to milliseconds. 
        let fixedtime = new Date(isotime.getTime() - (starttime.getTimezoneOffset() * 60000));
        // toISOString() is always 24 characters long: YYYY-MM-DDTHH:mm:ss.sssZ.
        // .slice(0, 19) removes the last 5 chars, ".sssZ",which is (UTC offset).
        // .replace('T', ' ') removes the pad between the date and time.
        return fixedtime.toISOString().slice(0, 19).replace('T', ' ');
    }
}

module.exports = EventStore;