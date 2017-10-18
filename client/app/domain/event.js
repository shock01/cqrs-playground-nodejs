class Event {
    static create(/**Object*/event) /**Object*/ {
        let immutable = Object.assign({}, event);
        Object.freeze(immutable);
        return immutable;
    }
}
module.exports = Event;