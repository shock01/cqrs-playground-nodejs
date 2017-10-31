const expect = require('chai').expect;
const { spy, stub, createStubInstance } = require('sinon')

const logger = require('../../application/logger');
const StateMachine = require('./statemachine');
const StateRepository = require('./staterespository');

describe('statemachine', () => {

    let classUnderTest;
    let state;
    let keyGenerator;
    // needed to load the actual aggregate by key
    let correlation = (ctx, event) => ctx.message.aggregateId;

    beforeEach(() => {
        // or the initially should return the key to be used and not
        // mix up event filtering and getting the storage key for the state
        // should there be multiple listeners per event, or should we just store all states
        // and just iterate them which might be faster than a million event handlers.
        state = {};
        keyGenerator = stub().returns('key');
        repository = createStubInstance(StateRepository);
        repository.store.returns(Promise.resolve({}));
        repository.byKey.returns(Promise.resolve(state));
        classUnderTest = new StateMachine(logger, repository, keyGenerator);
    });

    it('should register an event definition', () => {
        let result = classUnderTest.event('test', correlation);
        expect(result).to.equal(classUnderTest);
    });

    describe('initially', () => {
        beforeEach(() => classUnderTest.event('test', correlation));
        it('should throw for unknown event', () => {
            expect(() => classUnderTest.initially('monkey')).to.throw(`unknown event: monkey`);
        });
        it('should return `then` when known', () => {
            expect(typeof classUnderTest.initially('test').then).to.equal('function');
        });
        describe('then callback', () => {
            let context;
            beforeEach(() => {
                context = classUnderTest.initially('test').then;
            });
            it('should have `transitionTo', () => {
                expect(typeof context(() => { }).transitionTo).to.equal('function');
            });
            it('should have `then', () => {
                expect(typeof context(() => { }).then).to.equal('function');
            });
            describe('when state is initial/default', () => {
                let provider,
                    event = { type: 'test' };

                beforeEach(() => {
                    provider = spy();
                    context(provider);
                    return classUnderTest.handle({
                        eventType: 'test',
                        data: event
                    })
                });

                it('should call key generator', () => {
                    expect(keyGenerator.calledWith(event)).to.be.ok;
                });

                it('should call repository for state', () => {
                    expect(repository.byKey.calledWith('key')).to.be.ok;
                });

                it('should call thenable', () => {
                    expect(provider.called).to.be.ok;
                });

            });
        });

        describe('transitionTo callback', () => {
            let context;
            beforeEach(() => {
                context = classUnderTest.initially('test').transitionTo;
            });

            describe('when state is initial/default', () => {
                let provider,
                    event = { type: 'test' };

                beforeEach(() => {
                    provider = stub().returns('nextState');
                    context(provider);
                });

                it('should call transitionTo the state', () => {
                    return classUnderTest.handle({
                        eventType: 'test',
                        data: event
                    }).then((context) => {
                        expect(provider.called).to.be.ok;
                        expect(context.state).to.equal('nextState');
                        expect(repository.store.calledWith(context)).to.be.ok;
                    });
                });
            });
        });
    });
});