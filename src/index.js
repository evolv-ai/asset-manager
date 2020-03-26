import Evolv from '@evolv/javascript-sdk';

function EvolvAssetManager(options) {
	const client = new Evolv(options);

	// Expose client and context proprties
	Object.defineProperty(this, 'client', { get: function () { return client }});
	Object.defineProperty(this, 'context', { get: function () { return client.context }});

	// Expose client methods for easier access
	this.initialize = client.initialize.bind(client);
	this.emit = client.emit.bind(client);
	this.confirm = client.confirm.bind(client);
	this.contaminate = client.contaminate.bind(client);

	const context = {
		web: {
			url: window.location.href
		},
		user_attributes: options.user.attributes
	}

	client.initialize(
		options.user.uid,
		options.user.sid,
		context
	);

	const maxTimeoutAttempts = 3
	const maxTimeout = 1000

	let timeoutAttempts = 0
	let appliedClasses = [];
	let unappliedFunctions = new Set();
	let appliedFunctions = new Set();

	function retrieveEvolvJsAsset() {
		let jsAsset;
	
		const scripts = document.getElementsByTagName('script');
	
		for (let i = 0; i < scripts.length; i++) {
			const script = scripts[i];
			if (script.src && script.src.indexOf('evolv.ai') >= 0 && script.src.indexOf('assets.js') >= 0) {
				jsAsset = script;
				break;
			}
		}
	
		return jsAsset;
	}

	const invokeFunctions = function () {
		const evolv = window._evolv;
		if (typeof evolv === 'undefined' || !evolv.javascript || !evolv.javascript.variants) {
			if (timeoutAttempts < maxTimeoutAttempts) {
				this.timer = setTimeout(this, maxTimeout);
				timeoutAttempts++
			} else {
				client.contaminate();
			}
			return;
		}

		const promises = [];
		unappliedFunctions.forEach(function (key) {
			if (key in evolv.javascript.variants) {
				promises.push(evolv.javascript.variants[key]());
				appliedFunctions.add(key);
			}
		});

		Promise.all(promises)
			.then(function () {
				client.confirm()
			})
			.catch(function (err) {
				client.contaminate();
			});
	};

	const jsAsset = retrieveEvolvJsAsset();

	client.getActiveKeys('web').listen(function (keys) {
		const liveContexts = keys.map(function (key) {
			return 'evolv_'.concat(key.replace(/\./g, '_'));
		});

		if (appliedClasses.length) {
			appliedClasses.forEach(function (c) {
				document.documentElement.classList.remove(c);
			});
		}

		liveContexts.forEach(function (c) {
			document.documentElement.classList.add(c);
		});
		appliedClasses = liveContexts.slice();

		if (jsAsset) {
			liveContexts.forEach(function (key) {
				if (!appliedFunctions.has(key)) {
					unappliedFunctions.add(key);
				}
			});
			invokeFunctions.call(invokeFunctions);
		} else {
			client.confirm();
		}
	});
}

export default EvolvAssetManager;
