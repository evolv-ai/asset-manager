import all from './all.js';
import { MiniPromise } from "@evolv/javascript-sdk";
import { toContextKey } from './keys.js';

const MAX_TIMEOUT = 100;

function main(client, options, _performance) {
	let appliedClasses = [];
	let functions = new Set();
	let applyTimeout = true;
	let confirmed = false;
	options = options || {};

	function retrieveEvolvCssAsset(environment) {
		return document.querySelector('link[href *= "' + environment + '"][href *= "assets.css"]');
	}

	function retrieveEvolvJsAsset(environment) {
		return document.querySelector('script[src *= "' + environment + '"][src *= "assets.js"]');
	}

	function confirm() {
		if (!confirmed) {
			client.confirm();
			confirmed = true;
		}
	}

	const invokeFunctions = function(subset) {
		const evolv = window.evolv;
		if (typeof evolv === 'undefined' || !evolv.javascript || !evolv.javascript.variants) {
			if (!applyTimeout) {
				return;
			}

			const timeNow = Date.now();
			const domContentLoadedEventStart = (_performance || performance).timing.domContentLoadedEventStart;
			var threshold = options.timeoutThreshold || 60000;
			if (domContentLoadedEventStart === 0 || timeNow < domContentLoadedEventStart + threshold) {
				setTimeout(function() {
					invokeFunctions(subset);
				}, MAX_TIMEOUT);
			} else {
				client.contaminate();
				applyTimeout = false;
				console.warn('[Evolv]: Loading of variants timed out.');
			}
			return;
		}

		const promises = [];

		functions.forEach(function (key) {
			if (subset && subset.indexOf(toContextKey(key)) > -1) {
				return;
			}

			if (key in evolv.javascript.variants) {
				let promise = MiniPromise.createPromise(function(resolve, reject) {
					try {
						if (!evolv.javascript.variants[key](resolve, reject)) {
							resolve();
						}
					} catch(err) {
						reject(err);
					}
				});
				promises.push(promise);
			}
		});

		all(promises).then(function () {
			confirm();
		})
		.catch(function(err) {
			client.contaminate();
			console.warn('[Evolv]: An error occurred while applying a javascript mutation. ' + err);
		}).finally(function() {
			applyTimeout = false;
		});
	};

	client.getActiveKeys('web').listen(function (keys) {
		const environment = client.environment;
		const cssAsset = retrieveEvolvCssAsset(environment);
		const jsAsset = retrieveEvolvJsAsset(environment);

		const liveContexts = keys.current.map(function (key) {
			return 'evolv_'.concat(key.replace(/\./g, '_'));
		});

		appliedClasses.forEach(function (c) {
			document.documentElement.classList.remove(c);
		});

		if (cssAsset) {
			liveContexts.forEach(function (c) {
				document.documentElement.classList.add(c);
			});
			appliedClasses = liveContexts.slice();
		}

		if (jsAsset && liveContexts.length > 0) {
			liveContexts.forEach(function (key) {
				functions.add(key);
			});

			invokeFunctions(keys.previous);
		} else if (cssAsset && liveContexts.length > 0) {
			confirm();
		}
	});
}

function EvolvAssetManager(client, options, performance) {
	client.context.set('web.url', window.location.href);

	// Expose client and context proprties
	Object.defineProperty(this, 'client', { get: function () { return client }});
	Object.defineProperty(this, 'context', { get: function () { return client.context }});

	main(client, options, performance);
}

export default EvolvAssetManager;
