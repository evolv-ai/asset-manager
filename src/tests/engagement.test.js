import sinon from 'sinon';
import * as assert from 'assert';
import { StorageMock } from "./mocks/document.mock.js";
import EvolvMock from './mocks/evolv.mock.js';
import { _addNewPageLoadEmitter, _addTimerEmitter, _addWebUrlChangeEmitter, _addEngagedUserEventEmitter, ENGAGEMENT_SESSION_KEY } from '../engagement.js'

describe('engagement event firing', () => {
    let client;
    beforeEach(() => {
		client = new EvolvMock();
    });

    describe('checks event is fired if new page is loaded in session', () => {
        let sessionStorage;

        beforeEach(() => {
            sessionStorage = new StorageMock();
        });

        it('should not fire if session value is unset', () => {
            _addNewPageLoadEmitter(client, sessionStorage);

            assert.strictEqual(client.context.get('engaged'), undefined, 'Event should not have been set');
        });

        it('should set the session value if unset', () => {
            assert.strictEqual(sessionStorage.getItem(ENGAGEMENT_SESSION_KEY), undefined, 'engaged session key should start unset')
            _addNewPageLoadEmitter(client, sessionStorage);

            assert.strictEqual(sessionStorage.getItem(ENGAGEMENT_SESSION_KEY), true, 'engaged session key be set after check')
        });

        it('should fire if session value set', () => {
            sessionStorage.setItem(ENGAGEMENT_SESSION_KEY, true);
            _addNewPageLoadEmitter(client, sessionStorage);

            assert.strictEqual(client.context.get('engaged'), true, 'Event should have been set');
        });
    });

    describe('checks event is fired after timer elapses', () => {
        const performance = {
            now: function() {
                return 0
            }
        }
        it('should not fire before timer elapses', () => {
            _addTimerEmitter(client, performance, 10);

            assert.strictEqual(client.context.get('engaged'), undefined, 'Event should not have been set');
        });

        it('should fire after timer elapses - no overrides from config', (done) => {
            sinon.stub(client, 'getEnvConfig').callsFake(() => {
                return Promise.resolve(undefined);
            });

            _addTimerEmitter(client, performance, 10);

            setTimeout(() => {
                assert.strictEqual(client.context.get('engaged'), true, 'Event should have been set');
                done();
            }, 20);
        });

        it('should fire after timer elapses - no overrides from config, no performance api', (done) => {
            sinon.stub(client, 'getEnvConfig').callsFake(() => {
                return Promise.resolve(undefined);
            });

            _addTimerEmitter(client, {}, 10);

            setTimeout(() => {
                assert.strictEqual(client.context.get('engaged'), true, 'Event should have been set');
                done();
            }, 20);
        });

        it('should fire after timer elapses - offsetting for when page loads', (done) => {
            performance.now = function() {
                return 10
            };

            sinon.stub(client, 'getEnvConfig').callsFake(() => {
                return Promise.resolve(undefined);
            });

            _addTimerEmitter(client, performance, 20);

            setTimeout(() => {
                assert.strictEqual(client.context.get('engaged'), true, 'Event should have been set');
                done();
            }, 15);
        });

        it('should not fire after timer elapses - offsetting for when page loads', (done) => {
            performance.now = function() {
                return 10
            };

            sinon.stub(client, 'getEnvConfig').callsFake(() => {
                return Promise.resolve(undefined);
            });

            _addTimerEmitter(client, performance, 20);

            setTimeout(() => {
                assert.strictEqual(client.context.get('engaged'), undefined, 'Event should have been set');
                done();
            }, 5);
        });

        it('should fire immediately if the user has already been on the page the required time', async () => {
            performance.now = function() {
                return 10
            };

            sinon.stub(client, 'getEnvConfig').callsFake(() => {
                return Promise.resolve(undefined);
            });

            _addTimerEmitter(client, performance, 5);

            await Promise.resolve();

            await new Promise((resolve) => {
                setTimeout(() => {
                    assert.strictEqual(client.context.get('engaged'), true, 'Event should have been set');
                    resolve();
                }, 0);
            });
        });
    });

    describe('checks event is fired if web.url is changed', () => {
        it('should fire if web.url is updated', () => {
            client.context.set('web.url', 'a');
            _addWebUrlChangeEmitter(client);
            client.context.set('web.url', 'b');

            assert.strictEqual(client.context.get('engaged'), true, 'Event should have been set');
        });

        it('should not fire if web.url is not changed', () => {
            client.context.set('web.url', 'a');
            _addWebUrlChangeEmitter(client);
            client.context.set('web.url', 'a');

            assert.strictEqual(client.context.get('engaged'), undefined, 'Event should not have been set');
        });
    });

    describe('checks event is fired if event is emitted that is marked as engaged user', () => {
        it('should not fire if standard event is fired', () => {
            _addEngagedUserEventEmitter(client);

            client.emit('test-event');

            assert.strictEqual(client.context.get('engaged'), undefined, 'Event should not have been set');
        });

        it('should fire if event with engagedUser metadata is fired', () => {
            _addEngagedUserEventEmitter(client);

            client.emit('test-event', {
                engagedUser: true
            });

            assert.strictEqual(client.context.get('engaged'), true, 'Event should have been set');
        });
    });
});