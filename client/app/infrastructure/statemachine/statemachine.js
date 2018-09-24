'use strict';

const INITIAL = 'initial';

/**
 * https://lostechies.com/chrispatterson/2009/01/17/state-machine-for-managing-sagas/
 * @callback StateMachine~keyGenerator
 * @param {EventSource} eventSource
 * @returns {string}
 */

class StateMachine {

    constructor(/**Logger*/logger, stateRepository, /**StateMachine~keyGenerator*/keyGenerator) {
        this.logger = logger;
        this.stateRepository = stateRepository;
        this.keyGenerator = keyGenerator;
        this.events = {};
        this.stateMapping = {};
    }

    async handle(/**EventSource*/eventSource) /**Promise<Object>*/ {
        let eventType = eventSource.eventType;
        if (!this.events.hasOwnProperty(eventType)) {
            // silently discard unknown event
            return;
        }
        let logger = this.logger,
            context = await this.context(eventSource),
            currentState = context.state || INITIAL,
            mapping = this.stateMapping[currentState];

        if (!mapping) {
            logger.warn(`no mapping found for state: ${currentState}`);
            // log warning here
            return;
        }
        let behaviour = mapping[eventType];

        if (!behaviour) {
            logger.warn(`no behaviour found for state: ${currentState} and event: ${eventType}`);
            return;
        }

        // call all the thens....and then call transitionTo ??
        logger.info(`behaviour found for state: ${currentState} and event: ${eventType}`);

        await Promise.all(behaviour.thenables
            .map(thenable => thenable(context, eventType)))

        let nextState = await behaviour.transitionTo();
        logger.debug(`setting state to: ${nextState}`);
        context.state = nextState;
        logger.debug('calling complete');
        await behaviour.complete();
        // @todo fix me
        await this.stateRepository.store(context);
        if (nextState !== currentState) {
            await this.handle(eventType);
        }
        return context;
    }

    // should load it and filter the collection based on tralalal
    // and if it's not there then it should actually generate an id for the context
    // context should be stored before transitionTo??
    // or each state should have a key generator which should generate a unique key...
    // based on the event....
    // stateMachine(, stateRepostiory, keyGenerator)
    // this is more scalabble and then we can reuse projectionReader, projectionWriter
    // however the leveldb instances are not cluster aware... so it needs to be implemented
    // usage mariadb for instance
    context(/**EventSource*/eventSource)/**Promise<Object>*/ {
        let key = this.keyGenerator(eventSource.data);
        return this.stateRepository.byKey(key).then(state => state || { key });
    }

    event(/**String*/type, /**Function*/correlation) {
        this.events[type] = correlation;
        return this;
    }

    /**
     * 
     * stateMachine.event('test')
     * 
     * stateMachine
     *  .initially('test')
     *  .then((state, event) => {})
     *  .transitionTo(() => 'nextState')
     */
    initially(/**String*/eventType) {
        return this.during(INITIAL, eventType);
    }

    during(state, eventType) {
        if (!this.events.hasOwnProperty(eventType)) {
            throw `unknown event: ${eventType}`;
        }
        if (!this.stateMapping[state]) {
            this.stateMapping[state] = {};
        }
        let behaviour = this.stateMapping[state][eventType] = {
            thenables: [],
            transitionTo: () => { return Promise.resolve() },
            complete: () => { return Promise.resolve() }
        };
        let fluent = {
            then(provider) {
                behaviour.thenables.push(provider);
                return fluent;
            },
            transitionTo(provider) {
                behaviour.transitionTo = provider;
            },
            complete(provider) {
                behaviour.complete = provider;
            }
        };
        return fluent;
    }
}

module.exports = StateMachine;




