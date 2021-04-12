import * as assert from 'assert';
import sinon from 'sinon';

import jsdom from './mocks/jsdom.js';
import EvolvMock from './mocks/evolv.mock.js';
import { Runner } from '../runner.js';
import { DeferredPromise } from './deferred-promise.js';
import wait from './wait.js';


const PollingInterval = 100;

describe('Runner', () => {
    let cleanup;
    const sandbox = sinon.createSandbox();

    /** @type Container */
    let container;

    beforeEach(() => {
        cleanup = jsdom();

        const client = new EvolvMock();
        sandbox.spy(client);

        window.evolv = {
            client: client,
            javascript: {
                variants: undefined
            }
        };

        global.evolv = window.evolv;

        container = {
            client: window.evolv.client,
            options: {
                legacyPollingInterval: PollingInterval,
                variantsLoaded: new DeferredPromise()
            },
            _performance: { timing: { domContentLoadedEventStart: (new Date()).getTime() }}
        };
    });

    afterEach(() => {
        window.close();
        sandbox.restore();

        cleanup();
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
                assert.strictEqual(runner.functions.length, 0);

                // Act
                evolv.javascript.variants = variants;
                container.options.variantsLoaded.resolve();

                await wait(0);

                // Assert
                assert.strictEqual(runner.functions.length, 2);
            });
        });

        describe('when variants are loaded manually (present before instantiation)', () => {
            it('should have functions loaded after instantiating runner', () => {
                // Arrange
                window.evolv.javascript.variants = variants;

                // Act
                const runner = new Runner(container);

                // Assert
                assert.strictEqual(runner.functions.length, 2);
            });
        });

        describe('when variants are loaded manually (present after instantiation)', () => {
            it('should have functions loaded after next tick of polling interval', async () => {
                // Arrange
                const runner = new Runner(container);

                // Act
                evolv.javascript.variants = variants;

                // Assert
                assert.strictEqual(runner.functions.length, 0);

                await wait(PollingInterval);
                assert.strictEqual(runner.functions.length, 2);
            });
        });

        it('should call contaminate() if variants are populated after timeout has elapsed', async () => {
            // Arrange
            const { client } = container;
            container.options.timeoutThreshold = 1;

            const runner = new Runner(container);
            const contaminateSpy = container.client.contaminate;

            // Act
            await wait(10);

            window.evolv.javascript.variants = variants;
            container.options.variantsLoaded.resolve();

            await wait(0);

            // Assert
            assert.ok(contaminateSpy.called);

            assert.ok(Object.values(window.evolv.javascript.variants).every(fn => !fn.called));
            assert.strictEqual(client.confirmations, 0);
            assert.strictEqual(client.contaminations, 1);
        });

        it('should not call contaminate() if variants are populated before timeout has elapsed', async () => {
            // Arrange
            container.options.timeoutThreshold = 100;

            const runner = new Runner(container);
            const contaminateSpy = container.client.contaminate;

            // Act
            await wait(10);

            evolv.javascript.variants = variants;
            container.options.variantsLoaded.resolve();

            await wait(0);

            // Assert
            assert.strictEqual(contaminateSpy.called, false);
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
            assert.strictEqual(spy.called, false);

            // Act
            evolv.javascript.variants = variants;
            container.options.variantsLoaded.resolve();

            await wait(0);

            // Assert
            assert.strictEqual(spy.called, true);
        });
    });

    describe('execute()', () => {
        let variants;

        beforeEach(() => {
            const immediateFn = sinon.spy(function() {});
            immediateFn.timing = 'immediate';

            const legacyFn = sinon.spy(function(resolve) {});
            legacyFn.timing = 'legacy';

            const domFn = sinon.spy(function(resolve) {});
            domFn.timing = 'dom-content-loaded';

            const onloadFn = sinon.spy(function(resolve) {});
            onloadFn.timing = 'loaded';

            variants = {
                evolv_web_abc_immediate: immediateFn,
                evolv_web_abc_legacy: legacyFn,
                evolv_web_abc_dom: domFn,
                evolv_web_abc_onload: onloadFn,
            };
        });

        it('should not invoke functions until appropriate run level', async () => {
            // Arrange
            const runner = new Runner(container);

            runner.updateFunctionsToRun([
                'evolv_web_abc_immediate',
                'evolv_web_abc_legacy',
                'evolv_web_abc_dom',
                'evolv_web_abc_onload',
            ]);

            evolv.javascript.variants = variants;
            container.options.variantsLoaded.resolve();

            // Act & Assert
            await wait(0);

            assert.strictEqual(variants.evolv_web_abc_immediate.called, true);
            assert.strictEqual(variants.evolv_web_abc_legacy.called, false);
            assert.strictEqual(variants.evolv_web_abc_dom.called, false);
            assert.strictEqual(variants.evolv_web_abc_onload.called, false);

            await wait(PollingInterval); // Enough to let legacy timer finish

            assert.strictEqual(variants.evolv_web_abc_legacy.called, true);
            assert.strictEqual(variants.evolv_web_abc_dom.called, false);
            assert.strictEqual(variants.evolv_web_abc_onload.called, false);

            global.advanceReadyState('interactive');

            assert.strictEqual(variants.evolv_web_abc_dom.called, true);
            assert.strictEqual(variants.evolv_web_abc_onload.called, false);

            global.advanceReadyState('complete');

            assert.strictEqual(variants.evolv_web_abc_onload.called, true);
        });
    });

    describe('when invocation succeeds', () => {
        let confirmSpy;
        let contaminateSpy;
        let runner;

        beforeEach(() => {
            confirmSpy = container.client.confirm;
            contaminateSpy = container.client.contaminate;

            const immediateFn = function() {};
            immediateFn.timing = 'immediate';

            const immediateAsyncFn = function(resolve) {
                setTimeout(resolve, 0);
                return true;
            };
            immediateAsyncFn.timing = 'immediate';

            const legacyFn = function() {};
            legacyFn.timing = 'legacy';

            const legacyAsyncFn = function(resolve) {
                setTimeout(resolve, 0);
                return true;
            };
            legacyAsyncFn.timing = 'legacy';

            const domContentLoadedFn = function() {};
            domContentLoadedFn.timing = 'dom-content-loaded';

            const domContentLoadedAsyncFn = function(resolve) {
                setTimeout(resolve, 0);
                return true;
            };
            domContentLoadedAsyncFn.timing = 'dom-content-loaded';

            const loadedFn = function() {};
            loadedFn.timing = 'loaded';

            const loadedAsyncFn = function(resolve) {
                setTimeout(resolve, 0);
                return true;
            };
            loadedAsyncFn.timing = 'loaded';

            evolv.javascript.variants = {
                evolv_web_abc_immediate: immediateFn,
                evolv_web_abc_immediateAsync: immediateAsyncFn,
                evolv_web_abc_legacy: legacyFn,
                evolv_web_abc_legacyAsync: legacyAsyncFn,
                evolv_web_abc_dom: domContentLoadedFn,
                evolv_web_abc_domAsync: domContentLoadedAsyncFn,
                evolv_web_abc_loaded: loadedFn,
                evolv_web_abc_loadedAsync: loadedAsyncFn
            };

            runner = new Runner(container);
        });

        describe('for an immediate synchronous function', () => {
            it('should call confirm() and not contaminate()', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_immediate'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(0);

                // Assert
                assert.strictEqual(confirmSpy.called, true);
                assert.strictEqual(contaminateSpy.called, false);
            });
        });

        describe('for an immediate async function', () => {
            it('should call confirm() and not contaminate()', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_immediateAsync'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(10);

                // Assert
                assert.strictEqual(confirmSpy.called, true);
                assert.strictEqual(contaminateSpy.called, false);
            });
        });

        describe('for a legacy synchronous function', () => {
            it('should call confirm() and not contaminate()', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_legacy'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(10);

                // Assert
                assert.strictEqual(confirmSpy.called, true);
                assert.strictEqual(contaminateSpy.called, false);
            });
        });

        describe('for a legacy async function', () => {
            it('should call confirm() and not contaminate()', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_legacyAsync'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(0);

                // Assert
                assert.strictEqual(confirmSpy.called, true);
                assert.strictEqual(contaminateSpy.called, false);
            });
        });

        // describe.only('for a dom-content-loaded synchronous function', () => {
        describe('for a dom-content-loaded synchronous function', () => {
            it('should call confirm() and not contaminate()', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_dom'
                ]);

                await wait(0);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(0);

                // Assert
                assert.strictEqual(confirmSpy.callCount, 1);
                assert.strictEqual(contaminateSpy.called, false);
            });
        });

        describe('for a dom-content-loaded async function', () => {
            it('should call confirm() and not contaminate()', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_domAsync'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(10);

                // Assert
                assert.strictEqual(confirmSpy.callCount, 1);
                assert.strictEqual(contaminateSpy.called, false);
            });
        });

        describe('for a loaded synchronous function', () => {
            it('should call confirm() and not contaminate()', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_loaded'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(0);

                // Assert
                assert.strictEqual(confirmSpy.callCount, 1);
                assert.strictEqual(contaminateSpy.called, false);
            });
        });

        describe('for a loaded async function', () => {
            it('should call confirm() and not contaminate()', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_loadedAsync'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(0);

                // Assert
                assert.strictEqual(confirmSpy.callCount, 1);
                assert.strictEqual(contaminateSpy.called, false);
            });
        });
    });

    describe('when invocation fails', () => {
        let confirmSpy;
        let contaminateSpy;
        let runner;

        beforeEach(() => {
            confirmSpy = container.client.confirm;
            contaminateSpy = container.client.contaminate;

            const immediateFn = function() { throw new Error(); };
            immediateFn.timing = 'immediate';

            const immediateAsyncFn = function(_, reject) {
                setTimeout(reject, 0);
                return true;
            };
            immediateAsyncFn.timing = 'immediate';

            const legacyFn = function() { throw new Error(); };
            legacyFn.timing = 'legacy';

            const legacyAsyncFn = function(_, reject) {
                setTimeout(reject, 0);
                return true;
            };
            legacyAsyncFn.timing = 'legacy';

            const domContentLoadedFn = function() { throw new Error(); };
            domContentLoadedFn.timing = 'dom-content-loaded';

            const domContentLoadedAsyncFn = function(_, reject) {
                setTimeout(reject, 0);
                return true;
            };
            domContentLoadedAsyncFn.timing = 'dom-content-loaded';

            const loadedFn = function() { throw new Error(); };
            loadedFn.timing = 'loaded';

            const loadedAsyncFn = function(_, reject) {
                setTimeout(reject, 0);
                return true;
            };
            loadedAsyncFn.timing = 'loaded';

            evolv.javascript.variants = {
                evolv_web_abc_immediate: immediateFn,
                evolv_web_abc_immediateAsync: immediateAsyncFn,
                evolv_web_abc_legacy: legacyFn,
                evolv_web_abc_legacyAsync: legacyAsyncFn,
                evolv_web_abc_dom: domContentLoadedFn,
                evolv_web_abc_domAsync: domContentLoadedAsyncFn,
                evolv_web_abc_loaded: loadedFn,
                evolv_web_abc_loadedAsync: loadedAsyncFn
            };

            runner = new Runner(container);
        });

        describe('for an immediate synchronous function', () => {
            it('should call contaminate() and not confirm()', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_immediate'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(0);

                // Assert
                assert.strictEqual(confirmSpy.called, false);
                assert.strictEqual(contaminateSpy.called, true);
            });
        });

        describe('for an immediate async function', () => {
            it('should call contaminate() and not confirm()', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_immediateAsync'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(10);

                // Assert
                assert.strictEqual(confirmSpy.called, false);
                assert.strictEqual(contaminateSpy.called, true);
            });
        });

        describe('for a legacy synchronous function', () => {
            it('should call contaminate() and not confirm()', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_legacy'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(10);

                // Assert
                assert.strictEqual(confirmSpy.called, false);
                assert.strictEqual(contaminateSpy.called, true);
            });
        });

        describe('for a legacy async function', () => {
            it('should call contaminate() and not confirm()', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_legacyAsync'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(0);

                // Assert
                assert.strictEqual(confirmSpy.called, false);
                assert.strictEqual(contaminateSpy.called, true);
            });
        });

        describe('for a dom-content-loaded synchronous function', () => {
            it('should call confirm() once and contaminate() once', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_dom'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(0);

                // Assert
                assert.strictEqual(confirmSpy.callCount, 1);
                assert.strictEqual(contaminateSpy.called, true);
            });
        });

        describe('for a dom-content-loaded async function', () => {
            it('should call confirm() once and contaminate() once', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_domAsync'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(0);

                // Assert
                assert.strictEqual(confirmSpy.callCount, 1);
                assert.strictEqual(contaminateSpy.called, true);
            });
        });

        describe('for a loaded synchronous function', () => {
            it('should call confirm() once and contaminate() once', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_loaded'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(0);

                // Assert
                assert.strictEqual(confirmSpy.callCount, 1);
                assert.strictEqual(contaminateSpy.called, true);
            });
        });

        describe('for a loaded async function', () => {
            it('should call confirm() once and contaminate() once', async () => {
                // Arrange
                runner.updateFunctionsToRun([
                    'evolv_web_abc_loadedAsync'
                ]);

                // Act
                global.advanceReadyState('interactive');
                global.advanceReadyState('complete');

                await wait(0);

                // Assert
                assert.equal(confirmSpy.callCount, 1);
                assert.equal(contaminateSpy.called, true);
            });
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
                evolv_web_abc_immediateNotApplied: immediateNotAppliedFn,
                evolv_web_abc_legacy: legacyFn,
                evolv_web_abc_notApplied: notAppliedFn
            };
        });

        it('should call confirm()', async () => {
            // Arrange
            const spy = container.client.confirm;
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

            global.advanceReadyState('interactive');
            global.advanceReadyState('complete');

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
            const confirmSpy = container.client.confirm;
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

            global.advanceReadyState('interactive');
            global.advanceReadyState('complete');

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

    describe('with 1 immediate and 1 loaded function', () => {
        let variants;

        beforeEach(() => {
            const immediateFn = function(resolve) {};
            immediateFn.timing = 'immediate';

            const onloadFn = function(resolve) {
                setTimeout(resolve, 200);
                return true;
            };
            onloadFn.timing = 'loaded';

            variants = {
                evolv_web_abc_immediate: immediateFn,
                evolv_web_abc_onload: onloadFn
            };
        });

        it('should call confirm() twice', async () => {
            // Arrange
            const spy = container.client.confirm;
            const runner = new Runner(container);

            runner.updateFunctionsToRun([
                'evolv_web_abc_immediate',
                'evolv_web_abc_onload',
            ]);

            // Act
            evolv.javascript.variants = variants;
            container.options.variantsLoaded.resolve();

            await wait(0);

            assert.strictEqual(spy.callCount, 1);

            global.advanceReadyState('interactive');
            global.advanceReadyState('complete');

            // Assert
            await wait(300);

            assert.strictEqual(spy.callCount, 2);
        });
    });

    describe('with 2 immediate/legacy late-resolving functions and 1 synchronous loaded function', () => {
        let variants;

        beforeEach(() => {
            const immediateFn = sinon.spy(function(resolve) {
                setTimeout(resolve, 1000);
                return true;
            });
            immediateFn.timing = 'immediate';

            const legacyFn = sinon.spy(function(resolve) {
                setTimeout(resolve, 1000);
                return true;
            });
            legacyFn.timing = 'legacy';

            const onloadFn = sinon.spy(function(resolve) {});
            onloadFn.timing = 'loaded';

            variants = {
                evolv_web_abc_immediate: immediateFn,
                evolv_web_abc_legacy: legacyFn,
                evolv_web_abc_onload: onloadFn
            };
        });

        it('should call confirm() only after immediate and legacy functions resolve', async () => {
            // Arrange
            const confirmSpy = container.client.confirm;
            const runner = new Runner(container);

            runner.updateFunctionsToRun([
                'evolv_web_abc_immediate',
                'evolv_web_abc_legacy',
                'evolv_web_abc_onload',
            ]);

            // Act & Assert
            evolv.javascript.variants = variants;
            container.options.variantsLoaded.resolve();

            await wait(0);

            global.advanceReadyState('interactive');

            await wait(0);

            assert.strictEqual(confirmSpy.called, false);
            assert.strictEqual(variants.evolv_web_abc_onload.called, false);

            global.advanceReadyState('complete');

            await wait(0);

            assert.strictEqual(confirmSpy.called, false);
            assert.strictEqual(variants.evolv_web_abc_onload.called, true);

            await wait(1000);

            assert.strictEqual(confirmSpy.called, true);
        });
    });
});
