import { MiniPromise } from '@evolv/client';
import { Helpers } from './helpers.js';
import { toContextKey } from './keys.js';
import { toUnderscoreKey } from './utils.js';

/** @typedef {'immediate' | 'legacy' | 'dom-content-loaded' | 'loaded' | 'wait-for-elements'} Timing */
/** @typedef {'not-runnable' | 'runnable' | 'running' | 'resolved' | 'rejected'} Status */

/**
 * @typedef FunctionDef
 * @property {string} key
 * @property {Timing} timing
 * @property {Status} status
 * @property {number|null} runNumber
 * @property {number} calls
 * @property {Function} handler
 * @property {function():void|null} disposer
 */

/**
 * @typedef RunHistory
 * @property {string[]} neededToConfirm
 */

/**
 * @param {FunctionDef} def
 * @returns boolean
 */
const isImmediateOrLegacy = function(def) {
	return ['immediate', 'legacy'].indexOf(def.timing) !== -1;
};

/**
 * @param {FunctionDef} def
 * @returns boolean
 */
const hasNotRun = function(def) {
	return def.status === 'runnable';
};

/**
 * @param {FunctionDef} def
 * @returns boolean
 */
const hasNotCompleted = function(def) {
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
	// Ready States
	loading: RunLevel.Immediate,
	interactive: RunLevel.Interactive,
	complete: RunLevel.Complete,

	// Timing Options
	immediate: RunLevel.Immediate,
	legacy: RunLevel.Legacy,
	'dom-content-loaded': RunLevel.Interactive,
	'wait-for-elements': RunLevel.Interactive,
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
		this.runLevel = levelMap[document.readyState];

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
		// Needed to prevent test failures when window is disposed
		if (typeof window === 'undefined') {
			return false;
		}

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
				calls: 0,
				handler: fn,
				disposer: null
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
		if (!this.initialized) {
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
		const def = this.functions.filter(function (fn) { return fn.key === key; })[0];

		if (!def || def.status !== 'not-runnable') {
			return;
		}

		def.status = 'runnable';
	};

	/**
	 * @param {string} key
	 */
	Runner.prototype.unschedule = function (key) {
		const def = this.functions.filter(function (fn) { return fn.key === key; })[0];

		// TODO: Devise way to deal with in-flight promises
		def.status = 'not-runnable';
		def.disposer && def.disposer();
	};

	/**
	 * @param {string} prefix Dot-separated prefix
	 */
	Runner.prototype.unscheduleByPrefix = function(prefix) {
		this.functions
			.filter(function(def) {
				return def.key.startsWith(toUnderscoreKey(prefix));
			})
			.forEach(function(def) {
				this.unschedule(def.key);
			}.bind(this));
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

		const functionsOutstanding = this.functions
			.filter(runnableAtCurrentLevel)
			.filter(hasNotCompleted);

		const neededToConfirm = functionsOutstanding
			.filter(isImmediateOrLegacy)
			.map(function (def) { return def.key; });

		this.runs.push(Object.freeze({
			neededToConfirm: neededToConfirm
		}));

		const runNumber = this.runs.length;

		functionsToRun.forEach(function (def) {
			def.status = 'running';
			def.runNumber = runNumber;
			def.calls += 1;

			const executor = this.getExecutor(def);
			def.disposer = executor.disposer;

			executor.promise
				.then(function () {
					if (def.status === 'running') {
						def.status = 'resolved';
					}
				})
				.catch(function (err) {
					const message = (err && err.message) ? err.message : '';

					def.status = 'rejected';
					client.contaminate({
						reason: 'error-thrown',
						details: message
					});

					console.warn('[Evolv]: An error occurred while applying a javascript mutation. ' + err);
				})
				.finally(function () {
					this.checkForConfirmation(runNumber);
				}.bind(this));
		}.bind(this));
	};

	/**
	 * @param {FunctionDef} def
	 * @return {{ promise:Promise.<void>, disposer: function():void }}
	 */
	Runner.prototype.getExecutor = function(def) {
		const fn = def.handler;
		const helpers = new Helpers();

		const promise = MiniPromise.createPromise(function(resolve, reject) {
			const callback = function(err) {
				if (err) {
					reject(err);
				}

				try {
					const thisArg = { key: toContextKey(def.key) };
					const result = def.handler.call(thisArg, resolve, reject);

					if (result !== true) {
						resolve();
					}
				} catch (err) {
					reject(err);
				}
			};

			if (fn.timing === 'wait-for-elements') {
				const selectors = fn.timingSelectors || [];
				helpers.waitFor(selectors, callback);
			} else {
				callback();
			}
		});

		return {
			promise: promise,
			disposer: helpers.dispose.bind(helpers)
		};
	};

	/**
	 * @param {number} runNumber
	 * @returns void
	 * @private
	 */
	Runner.prototype.checkForConfirmation = function (runNumber) {
		const run = this.runs[runNumber - 1];

		const allResolvedOrNotRunnable = this.functions
			.filter(function (def) {
				return run.neededToConfirm.indexOf(def.key) !== -1;
			})
			.every(function (def) {
				return ['resolved', 'not-runnable'].indexOf(def.status) !== -1;
			});

		if (allResolvedOrNotRunnable) {
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
		const domContentLoadedEventStart = _performance ? _performance.timing.domContentLoadedEventStart : 0;
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
				// Needed to prevent test failures when window is disposed
				if (typeof window === 'undefined') {
					return;
				}

				setTimeout(doTiming, legacyPollingInterval || 100);
			}
		}.bind(this);

		doTiming();
	};

	return Runner;
}());

export { Runner };
