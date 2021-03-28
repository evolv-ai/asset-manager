import { MiniPromise } from '@evolv/javascript-sdk';
import { toContextKey } from './keys.js';

/** @typedef {'immediate' | 'legacy' | 'dom-content-loaded' | 'loaded'} Timing */
/** @typedef {'not-runnable' | 'runnable' | 'running' | 'resolved' | 'rejected'} Status */

/**
 * @typedef FunctionDef
 * @property {string} key
 * @property {Timing} timing
 * @property {Status} status
 * @property {number|null} runNumber
 * @property {Function} handler
 */

/**
 * @typedef RunHistory
 * @property {string[]} neededToConfirm
 */

/**
 * @param {FunctionDef} def
 * @returns boolean
 */
const isImmediateOrLegacy = function (def) {
    return ['immediate', 'legacy'].indexOf(def.timing) !== -1;
};

/**
 * @param {FunctionDef} def
 * @returns boolean
 */
const hasNotRun = function (def) {
    return def.status === 'runnable';
};

/**
 * @param {FunctionDef} def
 * @returns boolean
 */
const hasNotCompleted = function (def) {
    return ['runnable', 'running'].indexOf(def.status) !== -1;
};

/**
 * @enum {number}
 */
const RunLevel = {
    Immediate: 1,
    Legacy: 2,
    Interactive: 3,
    Complete: 4
};

const levelMap = {
    immediate: RunLevel.Immediate,
    legacy: RunLevel.Legacy,
    'dom-content-loaded': RunLevel.Immediate,
    loaded: RunLevel.Complete
};

const Runner = /** @class */ (function () {
    /**
     * @param {Container} container
     */
    function Runner(container) {
        this.container = container;

        /** @type {boolean} */
        this.initialized = false;

        /** @type {boolean} */
        this.timedOut = false;

        /** @type {RunLevel} */
        this.runLevel = RunLevel.Immediate;

        /** @type {RunHistory[]} */
        this.runs = [];

        /** @type {FunctionDef[]} */
        this.functions = [];

        /** @type {string[]|null} */
        this.deferred = null;

        this.onReadyStateChange = function () {
            switch (document.readyState) {
                case 'interactive':
                    this.setRunLevel(RunLevel.Interactive);
                    break;
                case 'complete':
                    this.setRunLevel(RunLevel.Complete);
                    break;
                default:
                    break;
            }
        }.bind(this);

        document.addEventListener('readystatechange', this.onReadyStateChange);
        this.doLegacyTiming();

        if (container.options.variantsLoaded) {
            container.options.variantsLoaded
                .then(function () {
                    this.loadFunctions();
                }.bind(this));
        }

        this.loadFunctions();
    }

    /**
     * @param {number} level
     * @returns void
     */
    Runner.prototype.setRunLevel = function (level) {
        const previous = this.runLevel;

        this.runLevel = Math.max(previous, level);

        if (this.runLevel !== previous) {
            this.execute();
        }
    };

    /**
     * @returns boolean
     * @private
     */
    Runner.prototype.areVariantsDefined = function () {
        const evolv = (window || {}).evolv;
        return (typeof evolv !== 'undefined' && evolv.javascript && evolv.javascript.variants);
    };

    /**
     * @returns void
     * @private
     */
    Runner.prototype.loadFunctions = function () {
        if (!this.areVariantsDefined() || this.initialized) {
            return;
        }

        this.initialized = true;

        if (this.hasTimeoutElapsed()) {
            return;
        }

        const evolv = window.evolv;
        const variants = evolv.javascript.variants;
        const entries = Object.keys(variants)
            .sort(function (a, b) {
                return a.length - b.length;
            });

        entries.forEach(function (key) {
            const fn = variants[key];
            this.functions.push({
                key: key,
                timing: fn.timing || 'legacy',
                status: 'not-runnable',
                runNumber: null,
                handler: fn
            });
        }.bind(this));

        if (this.deferred) {
            this.updateFunctionsToRun(this.deferred);
        }
    };

    /**
     * @param {string[]} keys
     * @returns void
     */
    Runner.prototype.updateFunctionsToRun = function (keys) {
        if (!this.areVariantsDefined()) {
            this.deferred = keys;
            return;
        }

        this.functions.forEach(function (def) {
            if (keys.indexOf(def.key) === -1) {
                this.unschedule(def.key);
            }
        }.bind(this));

        keys.forEach(function (key) {
            this.schedule(key);
        }.bind(this));

        this.execute();
    };

    /**
     * @param {string} key
     */
    Runner.prototype.schedule = function (key) {
        const def = this.functions.find(function (def) { return def.key === key; });

        if (!def || def.status !== 'not-runnable') {
            return;
        }

        def.status = 'runnable';
    };

    /**
     * @param {string} key
     */
    Runner.prototype.unschedule = function (key) {
        const def = this.functions.find(function (def) { return def.key === key; });
        if (!def || def.status !== 'runnable') {
            return;
        }
        // TODO: Devise way to deal with in-flight promises
        def.status = 'not-runnable';
    };

    /**
     * @returns void
     * @private
     */
    Runner.prototype.execute = function () {
        const client = this.container.client;

        const runnableAtCurrentLevel = function (def) {
            return levelMap[def.timing] <= this.runLevel;
        }.bind(this);

        const functionsToRun = this.functions
            .filter(runnableAtCurrentLevel)
            .filter(hasNotRun);

        const neededToConfirm = functionsToRun
            .concat(this.getConcurrent())
            .filter(isImmediateOrLegacy)
            .map(function (def) { return def.key; });

        this.runs.push(Object.freeze({
            neededToConfirm: neededToConfirm
        }));

        const runNumber = this.runs.length;

        functionsToRun.forEach(function (def) {
            def.status = 'running';
            def.runNumber = runNumber;

            const promise = MiniPromise.createPromise(function (resolve, reject) {
                try {
                    const thisArg = { key: toContextKey(def.key) };
                    const result = def.handler.call(thisArg, resolve, reject);

                    if (result !== true) {
                        resolve();
                    }
                }
                catch (err) {
                    reject(err);
                }
            });

            promise
                .then(function () { return def.status = 'resolved'; })
                .catch(function (err) {
                    def.status = 'rejected';
                    client.contaminate({
                        reason: 'error-thrown',
                        details: err.message
                    });
                    console.warn('[Evolv]: An error occurred while applying a javascript mutation. ' + err);
                })
                .finally(function () {
                    this.checkForConfirmation(runNumber);
                }.bind(this));
        }.bind(this));
    };

    /**
     * @return FunctionDef[]
     * @private
     */
    Runner.prototype.getConcurrent = function () {
        if (this.runLevel === levelMap['immediate']) {
            return this.functions
                .filter(function (def) { return def.timing === 'legacy'; })
                .filter(hasNotRun);
        } else if (this.runLevel === levelMap['legacy']) {
            return this.functions
                .filter(function (def) { return def.timing === 'immediate'; })
                .filter(hasNotCompleted);
        }
        else {
            return [];
        }
    };

    /**
     * @param {number} runNumber
     * @returns void
     * @private
     */
    Runner.prototype.checkForConfirmation = function (runNumber) {
        const run = this.runs[runNumber - 1];
        const allResolved = this.functions
            .filter(function (def) {
                return run.neededToConfirm.indexOf(def.key) !== -1;
            })
            .every(function (def) {
                return def.status === 'resolved';
            });

        if (allResolved) {
            this.confirm();
        }
    };

    /**
     * @returns void
     * @private
     */
    Runner.prototype.confirm = function () {
        this.container.client.confirm();
    };

    /**
     * @returns boolean
     * @private
     */
    Runner.prototype.hasTimeoutElapsed = function () {
        if (this.timedOut) {
            return true;
        }

        const _a = this.container, client = _a.client, options = _a.options, _performance = _a._performance;

        const timeNow = (new Date()).getTime();
        const domContentLoadedEventStart = _performance.timing.domContentLoadedEventStart;
        const threshold = options.timeoutThreshold || 60000;

        if (domContentLoadedEventStart > 0 && timeNow > domContentLoadedEventStart + threshold) {
            this.timedOut = true;

            client.contaminate({
                reason: 'timeout-exceeded',
                details: 'current time: ' + timeNow + ', domContentLoadedEventStart: ' + domContentLoadedEventStart + ', threshold: ' + threshold
            });

            console.warn('[Evolv]: Loading of variants timed out.');

            return true;
        }

        return false;
    };

    /**
     * @private
     */
    Runner.prototype.doLegacyTiming = function () {
        const legacyPollingInterval = this.container.options.legacyPollingInterval;

        const doTiming = function () {
            const elapsed = this.hasTimeoutElapsed();
            this.loadFunctions();

            if (this.initialized && !elapsed) {
                this.setRunLevel(levelMap.legacy);
            } else if (!elapsed) {
                setTimeout(doTiming, legacyPollingInterval || 100);
            }
        }.bind(this);

        doTiming();
    };

    return Runner;
}());

export { Runner };
