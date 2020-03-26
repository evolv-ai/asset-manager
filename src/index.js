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

	let appliedClasses = [];
	let unappliedFunctions = new Set();
	let appliedFunctions = new Set();

	const invokeFunctions = function () {
		const evolv = window._evolv;
		if (typeof evolv === 'undefined' || !evolv.javascript || !evolv.javascript.variants) {
			this.timer = setTimeout(this);
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
			.catch(function (err) {
				evolv.contaminate();
			});
	};

	client.getActiveKeys('web').listen(function (keys) {
		const classes = keys.map(function (key) {
			return 'evolv_'.concat(key.replace(/\./g, '_'));
		});
		console.log(classes)	

		if (appliedClasses.length) {
			appliedClasses.forEach(function (c) {
				document.documentElement.classList.remove(c);
			});
		}

		classes.forEach(function (c) {
			document.documentElement.classList.add(c);
		});
		appliedClasses = classes.slice();

		classes.forEach(function (key) {
			if (!appliedFunctions.has(key)) {
				unappliedFunctions.add(key);
			}
		});

		invokeFunctions.call(invokeFunctions);

		client.confirm();
	});
}

export default EvolvAssetManager;
