import * as assert from 'assert';
import EventEmitter from 'events';
import sinon from 'sinon';

import { Runner } from '../runner.js';
import { DeferredPromise } from './deferred-promise.js';
import EvolvMock from './mocks/evolv.mock.js';
import { DocumentMock } from './mocks/document.mock.js';
import wait from './wait.js';

const PollingInterval = 100;
let origWindow;

describe('Runner', () => {
    const sandbox = sinon.createSandbox();
    const emitter = new EventEmitter();

    /** @type Container */
    let container;

    beforeEach(() => {
        origWindow = global.window;

        const client = new EvolvMock();
        sandbox.spy(client);

        global.document = new DocumentMock({ emitter });
        global.evolv = {
            client: new EvolvMock(),
            javascript: {
                variants: undefined
            }
        };

        global.window = { location: {}, evolv: global.evolv };

        container = {
            client: global.evolv.client,
            options: {
                legacyPollingInterval: PollingInterval,
                variantsLoaded: new DeferredPromise()
            },
            _performance: { timing: { domContentLoadedEventStart: (new Date()).getTime() }}
        };
    });

    afterEach(() => {
        sandbox.restore();

        delete global.window;
        delete global.document;

        global.window = origWindow;
    });

    describe('loadFunctions()', () => {
        let variants;

        beforeEach(() => {
            const immediateFn = sinon.spy(function() {});
            immediateFn.timing = 'immediate';

            const legacyFn = sinon.spy(function(resolve) {
                setTimeout(resolve, 100);
                return true;
            });
            legacyFn.timing = 'legacy';

            variants = {
                evolv_web_abc_immediate: immediateFn,
                evolv_web_abc_legacy: legacyFn
            };
        });

        describe('when variants are loaded automatically (i.e. data-evolv-js=true)', () => {
            it('should load functions after "variantsLoaded" promise resolves', async () => {
                // Arrange
                const runner = new Runner(container);

                // Preconditions
                assert.equal(runner.functions.length, 0);

                // Act
                evolv.javascript.variants = variants;
                container.options.variantsLoaded.resolve();

                await wait(0);

                // Assert
                assert.equal(runner.functions.length, 2);
            });
        });

        describe('when variants are loaded manually (present before instantiation)', () => {
            it('should have functions loaded after instantiating runner', () => {
                // Arrange
                window.evolv.javascript.variants = variants;

                // Act
                const runner = new Runner(container);

                // Assert
                assert.equal(runner.functions.length, 2);
            });
        });

        describe('when variants are loaded manually (present after instantiation)', () => {
            it('should have functions loaded after next tick of polling interval', async () => {
                // Arrange
                const runner = new Runner(container);

                // Act
                evolv.javascript.variants = variants;

                // Assert
                assert.equal(runner.functions.length, 0);

                await wait(PollingInterval);
                assert.equal(runner.functions.length, 2);
            });
        });

        it('should call contaminate() if variants are populated after timeout has elapsed', async () => {
            // Arrange
            const { client } = container;
            container.options.timeoutThreshold = 1;

            const runner = new Runner(container);
            const contaminateSpy = sinon.spy(container.client, 'contaminate');

            // Act
            await wait(10);

            window.evolv.javascript.variants = variants;
            container.options.variantsLoaded.resolve();

            await wait(0);

            // Assert
            assert.ok(contaminateSpy.called);

            assert.ok(Object.values(window.evolv.javascript.variants).every(fn => !fn.called));
            assert.equal(client.confirmations, 0);
            assert.equal(client.contaminations, 1);
        });

        it('should not call contaminate() if variants are populated before timeout has elapsed', async () => {
            // Arrange
            container.options.timeoutThreshold = 100;

            const runner = new Runner(container);
            const contaminateSpy = sinon.spy(container.client, 'contaminate');

            // Act
            await wait(10);

            evolv.javascript.variants = variants;
            container.options.variantsLoaded.resolve();

            await wait(0);

            // Assert
            assert.equal(contaminateSpy.called, false);
        });
    });

    describe('updateFunctionsToRun()', () => {
        let variants;
        const spy = sinon.spy();

        beforeEach(() => {
            const immediateFn = spy;
            immediateFn.timing = 'immediate';

            const legacyFn = function(resolve) {
                setTimeout(resolve, 100);
                return true;
            };
            legacyFn.timing = 'legacy';

            variants = {
                evolv_web_abc_immediate: immediateFn,
                evolv_web_abc_legacy: legacyFn
            };
        });

        it('should defer running functions until variants have been defined', async () => {
            // Arrange
            const runner = new Runner(container);
            runner.updateFunctionsToRun(['evolv_web_abc_immediate']);

            // Preconditions
            assert.equal(spy.called, false);

            // Act
            evolv.javascript.variants = variants;
            container.options.variantsLoaded.resolve();

            await wait(0);

            // Assert
            assert.equal(spy.called, true);
        });
    });

    describe('with 1 immediate and 1 legacy function', () => {
        let variants;

        beforeEach(() => {
            const immediateFn = function() {};
            immediateFn.timing = 'immediate';

            const immediateNotAppliedFn = function() {};
            immediateNotAppliedFn.timing = 'immediate';

            const legacyFn = function(resolve) {
                setTimeout(resolve, 100);
                return true;
            };
            legacyFn.timing = 'legacy';

            const notAppliedFn = function(resolve) {
                setTimeout(resolve, 100);
                return true;
            };
            notAppliedFn.timing = 'legacy';

            variants = {
                evolv_web_abc_immediate: immediateFn,
                evolv_web_abc_immediateNotApplied: immediateFn,
                evolv_web_abc_legacy: legacyFn,
                evolv_web_abc_notApplied: notAppliedFn
            };
        });

        it('should call confirm()', async () => {
            // Arrange
            const spy = sinon.spy(container.client, 'confirm');
            const runner = new Runner(container);

            runner.updateFunctionsToRun([
                'evolv_web_abc_immediate',
                'evolv_web_abc_legacy',
            ]);

            // Act
            await wait(PollingInterval / 2); // In between legacy timer ticks

            evolv.javascript.variants = variants;
            container.options.variantsLoaded.resolve();

            await wait(PollingInterval); // Enough to let legacy timer finish

            document.readyState = 'interactive';
            emitter.emit('readystatechange');

            document.readyState = 'complete';
            emitter.emit('readystatechange');

            // Assert
            await wait(1000);

            assert.ok(spy.called);
        });
    });

    describe('with 1 immediate and 1 legacy function and a late applied legacy function', () => {
        let variants;

        beforeEach(() => {
            const immediateFn = function() {};
            immediateFn.timing = 'immediate';

            const legacyFn = function(resolve) {
                setTimeout(resolve, 100);
                return true;
            };
            legacyFn.timing = 'legacy';

            const lateLegacyFn = function(resolve) {
                // Intentionally will not resolve
                return true;
            };
            legacyFn.timing = 'legacy';

            variants = {
                evolv_web_abc_immediate: immediateFn,
                evolv_web_abc_legacy: legacyFn,
                evolv_web_abc_lateLegacy: lateLegacyFn
            };
        });

        it('should call confirm()', async () => {
            // Arrange
            const confirmSpy = sinon.spy(container.client, 'confirm');
            const runner = new Runner(container);

            runner.updateFunctionsToRun([
                'evolv_web_abc_immediate',
                'evolv_web_abc_legacy',
            ]);

            // Act
            await wait(PollingInterval / 2); // In between legacy timer ticks

            evolv.javascript.variants = variants;

            container.options.variantsLoaded.resolve();

            await wait(PollingInterval); // Enough to let legacy timer finish

            document.readyState = 'interactive';
            emitter.emit('readystatechange');

            document.readyState = 'complete';
            emitter.emit('readystatechange');

            await wait(200);

            runner.updateFunctionsToRun([
                'evolv_web_abc_immediate',
                'evolv_web_abc_legacy',
                'evolv_web_abc_lateLegacy',
            ]);

            // Assert
            await wait(1000);

            assert.ok(confirmSpy.called);
        });
    });
});
