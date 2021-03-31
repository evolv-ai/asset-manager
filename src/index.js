import { Runner } from './runner.js';

/**
 * @typedef Options
 * @property {number} timeoutThreshold
 * @property {number} legacyPollingInterval
 * @property {Promise} scriptPromise
 */

/**
 * @typedef Container
 * @property client
 * @property {Options} options
 * @property {Performance} _performance
 */

/**
 * @param {Container} container
 */
function main(container) {
	let appliedClasses = [];
	let confirmed = false;

	const client = container.client;

	function retrieveEvolvCssAsset(environmentId) {
		return document.querySelector('link[href *= "' + environmentId + '"][href *= "assets.css"]');
	}

	function retrieveEvolvJsAsset(environmentId) {
		return document.querySelector('script[src *= "' + environmentId + '"][src *= "assets.js"]');
	}

	function confirm() {
		if (!confirmed) {
			client.confirm();
			confirmed = true;
		}
	}

    const environment = client.environment;
    const cssAsset = retrieveEvolvCssAsset(environment);
    const jsAsset = retrieveEvolvJsAsset(environment);

    const runner = new Runner(container);

	client.getActiveKeys('web').listen(function (keys) {
		const liveContexts = keys.current
			.map(function (key) {
				return 'evolv_'.concat(key.replace(/\./g, '_'));
			})
			.sort(function (a, b) {
				return a.length - b.length;
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
            runner.updateFunctionsToRun(liveContexts);
		} else if (cssAsset && liveContexts.length > 0) {
			confirm();
		}
	});
}

/**
 * @param client
 * @param {Options} [options]
 * @param {Performance} [_performance]
 * @constructor
 */
function EvolvAssetManager(client, options, _performance) {
	client.context.set('web.url', window.location.href);

	// Expose client and context proprties
	Object.defineProperty(this, 'client', { get: function () { return client }});
	Object.defineProperty(this, 'context', { get: function () { return client.context }});

	/** @type {Container} */
	const container = {
		client: client,
		options: options || {},
		_performance: _performance || performance
	};

	main(container);
}

export default EvolvAssetManager;
