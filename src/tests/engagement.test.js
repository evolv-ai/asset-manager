import * as assert from 'assert';
import { StorageMock } from "./mocks/document.mock.js";
import EvolvMock from './mocks/evolv.mock.js';
import { _addNewPageLoadEmitter, _addTimerEmitter, _addWebUrlChangeEmitter, _addEngagedUserEventEmitter, ENGAGED_EVENT, ENGAGEMENT_SESSION_KEY } from '../engagement.js'

describe('checks event is fired if new page is loaded in session', () => {
    let client;
    let sessionStorage;
    let fired;

    beforeEach(() => {
        client = new EvolvMock();
        sessionStorage = new StorageMock();

        fired = false;
        client.on('event.emitted', (eventType, eventName) => {
            if (eventName === ENGAGED_EVENT) {
                fired = true;
            }
        })
    });

	it('should not fire if session value is unset', (done) => {
        _addNewPageLoadEmitter(client, sessionStorage);

        setTimeout(() => {
            assert.strictEqual(fired, false, 'Event should not have been fired');
            done();
        }, 0);
    });

    it('should set the session value if unset', () => {
        assert.strictEqual(sessionStorage.getItem(ENGAGEMENT_SESSION_KEY), undefined, 'engaged session key should start unset')
        _addNewPageLoadEmitter(client, sessionStorage);

        assert.strictEqual(sessionStorage.getItem(ENGAGEMENT_SESSION_KEY), true, 'engaged session key be set after check')
    });

    it('should fire if session value set', (done) => {
        sessionStorage.setItem(ENGAGEMENT_SESSION_KEY, true);
        _addNewPageLoadEmitter(client, sessionStorage);

        setTimeout(() => {
            assert.strictEqual(fired, true, 'Event should have been fired');
            done();
        }, 0);
    });
});

describe('checks event is fired after timer elapses', () => {
    let client;
    let fired;
    beforeEach(() => {
        client = new EvolvMock();

        fired = false;
        client.on('event.emitted', (eventType, eventName) => {
            if (eventName === ENGAGED_EVENT) {
                fired = true;
            }
        })
    });

	it('should not fire before timer elapses', (done) => {
        _addTimerEmitter(client, 10);

        setTimeout(() => {
            assert.strictEqual(fired, false, 'Event should not have been fired');
            done();
        }, 1);
    });

    it('should fire after timer elapses', (done) => {
        _addTimerEmitter(client, 10);

        setTimeout(() => {
            assert.strictEqual(fired, true, 'Event should have been fired');
            done();
        }, 20);
    });
});

describe('checks event is fired if web.url is changed', () => {
    let client;
    let fired;
    beforeEach(() => {
        client = new EvolvMock();

        fired = false;
        client.on('event.emitted', (eventType, eventName) => {
            if (eventName === ENGAGED_EVENT) {
                fired = true;
            }
        })
    });

	it('should fire if web.url is updated', (done) => {
        client.context.set('web.url', 'a');
        _addWebUrlChangeEmitter(client);
        client.context.set('web.url', 'b');

        setTimeout(() => {
            assert.strictEqual(fired, true, 'Event should have been fired');
            done();
        }, 0);
    });

    it('should not fire if web.url is not changed', (done) => {
        client.context.set('web.url', 'a');
        _addWebUrlChangeEmitter(client);
        client.context.set('web.url', 'a');

        setTimeout(() => {
            assert.strictEqual(fired, false, 'Event should have been fired');
            done();
        }, 0);
    });
});

describe('checks event is fired if event is emitted that is marked as engaged user', () => {
    let client;
    let fired;
    beforeEach(() => {
        client = new EvolvMock();

        fired = false;
        client.on('event.emitted', (eventType, eventName) => {
            if (eventName === ENGAGED_EVENT) {
                fired = true;
            }
        })
    });

	it('should not fire if standard event is fired', (done) => {
        _addEngagedUserEventEmitter(client);

        client.emit('test-event');

        setTimeout(() => {
            assert.strictEqual(fired, false, 'Event should have been fired');
           done();
        }, 0);
    });

    it('should fire if event with engagedUser metadata is fired', (done) => {
        _addEngagedUserEventEmitter(client);

        client.emit('test-event', {
            engagedUser: true
        });

        setTimeout(() => {
            assert.strictEqual(fired, true, 'Event should have been fired');
            done();
        }, 0);
    });
});