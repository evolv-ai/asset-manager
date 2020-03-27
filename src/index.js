import Evolv from '@evolv/javascript-sdk';

function main(client, options) {
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

	function retrieveEvolvCssAsset() {
		let cssAsset;
	
		const links = document.getElementsByTagName('link');

		for (let i = 0; i < links.length; i++) {
			const link = links[i];
			if (link.rel === 'stylesheet' && link.href && link.href.indexOf('evolv.ai') >= 0 && link.href.indexOf('assets.css') >= 0) {
				cssAsset = link;
				break;
			}
		}

		return cssAsset
	}

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

	client.getActiveKeys('web').listen(function (keys) {
		const cssAsset = retrieveEvolvCssAsset();
		const jsAsset = retrieveEvolvJsAsset();

		const liveContexts = keys.map(function (key) {
			return 'evolv_'.concat(key.replace(/\./g, '_'));
		});

		if (appliedClasses.length) {
			appliedClasses.forEach(function (c) {
				document.documentElement.classList.remove(c);
			});
		}

		if (cssAsset) {
			liveContexts.forEach(function (c) {
				document.documentElement.classList.add(c);
			});
			appliedClasses = liveContexts.slice();
		}

		if (jsAsset && liveContexts.length > 0) {
			liveContexts.forEach(function (key) {
				if (!appliedFunctions.has(key)) {
					unappliedFunctions.add(key);
				}
			});
			invokeFunctions.call(invokeFunctions);
		} else if (cssAsset && liveContexts.length > 0) {
			client.confirm();
		}
	});
}

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

	main(client, options);
}

export { main };
export default EvolvAssetManager;
