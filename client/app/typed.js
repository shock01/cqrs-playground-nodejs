/**
 * @typedef {Object} EventSource
 * @property {String} aggregateId
 * @property {String} aggregateType
 * @property {Number} sequence
 * @property {Number} eventDate
 * @property {String} eventType
 * @property {Number} version
 * @property {DomainEvent} data
 * 
 */

/**
 * @typedef {Object} DomainEvent
 * @property {String} id
 * @property {String} type
 */

/**
 * @typedef {DomainEvent} ProductCreated
 */

/**
 * @typedef {DomainEvent} ContentChanged
 * @property {Object} content
 */

/**
 * @typedef {Object} Command
 */