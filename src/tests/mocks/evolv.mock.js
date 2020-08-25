class EvolvMock {
	constructor(keys=[]) {
		this.confirmations = 0;
		this.contaminations = 0;
		this.initializations = 0;
		this.keys = keys;
		this.context = new EvolvContextMock();
	}

	initialize(uid, sid, remoteContext, localContext) {
		this.initializations++;
	}

	confirm() {
		this.confirmations++;
	}

	contaminate() {
		this.contaminations++;
	}

	getActiveKeys(prefix) {
		const keys = this.keys;
		const promise = new Promise((resolve, reject) => {
			resolve(true);
		});
		promise.listen = function(listener) {
			listener({
				current: keys.filter(key => key.startsWith(prefix)),
				previous: []
			})
		};
		return promise;
	}
}

class EvolvContextMock {
	constructor(values) {
		this.values = values || {};
	}

	set(key, value, local) {
		this.values[key] = value;
		return true;
	}
}

export default EvolvMock;
