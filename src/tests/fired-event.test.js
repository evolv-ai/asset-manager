import * as assert from 'assert';

import EvolvMock from './mocks/evolv.mock.js';
import firedEvents, { storeEventInSession } from '../fired-events.js';

describe('firedEvents', () => {
    beforeEach(() => {
        function mockStorage() {
            var storage = {};
            return {
                setItem: function(key, value) {
                    storage[key] = value || '';
                },
                getItem: function(key) {
                    return storage[key];
                }
            };
        };
        global.sessionStorage = mockStorage();
    })
    it('should set context from session', () => {
        global.sessionStorage.setItem('evolv:fe', JSON.stringify({example: true}));
        const client = new EvolvMock()
        firedEvents(client)
        assert.strictEqual(client.context.localContext.fired_events.example, true);
    })
    it('should set local context and session when an event is emitted', () => {
        const client = new EvolvMock()

        storeEventInSession(client, 'example')
        assert.strictEqual(client.context.localContext['fired_events.example'], true);
        assert.strictEqual(global.sessionStorage.getItem('evolv:fe'), '{"example":true}');
    })
    it('should extend session storage when an event is emitted', () => {
        global.sessionStorage.setItem('evolv:fe', JSON.stringify({example: true}));
        const client = new EvolvMock()

        storeEventInSession(client, 'example2')
        assert.strictEqual(client.context.localContext['fired_events.example2'], true);
        assert.strictEqual(global.sessionStorage.getItem('evolv:fe'), '{"example":true,"example2":true}');
    })
})