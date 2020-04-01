const MAX_TIMEOUT_ATTEMPTS = 3;
const MAX_TIMEOUT = 1000;


function main(client) {
	let timeoutAttempts = 0;
	let appliedClasses = [];
	let unappliedFunctions = new Set();
	let appliedFunctions = new Set();

	function retrieveEvolvCssAsset() {
		const styleSheets = document.getElementsByTagName("link");

		for (let i = 0; i < styleSheets.length; i++) {
			const link = styleSheets[i];
			if (link.href &&
					link.href.indexOf('evolv.ai') >= 0 &&
					link.href.indexOf('assets.css') >= 0) {
				return link;
			}
		}

		return undefined;
	}

	function retrieveEvolvJsAsset() {
		const scripts = document.scripts;
	
		for (let i = 0; i < scripts.length; i++) {
			const script = scripts[i];
			if (script.src && script.src.indexOf('evolv.ai') >= 0 && script.src.indexOf('assets.js') >= 0) {
				return script;
			}
		}
	
		return undefined;
	}

	const invokeFunctions = function () {
		const evolv = window.evolv;
		if (typeof evolv === 'undefined' || !evolv.javascript || !evolv.javascript.variants) {
			if (timeoutAttempts < MAX_TIMEOUT_ATTEMPTS) {
				setTimeout(this, MAX_TIMEOUT);
				timeoutAttempts++;
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
				console.warn('[Evolv]: Loading of variants timed out. ' + err);
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

function EvolvAssetManager(client) {
	client.context.set('web.url', window.location.href);

	// Expose client and context proprties
	Object.defineProperty(this, 'client', { get: function () { return client }});
	Object.defineProperty(this, 'context', { get: function () { return client.context }});

	main(client);
}

export default EvolvAssetManager;
