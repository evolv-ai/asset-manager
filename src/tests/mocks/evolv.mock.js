class EvolvMock {
	constructor(keys = []) {
		this.confirmations = 0;
		this.contaminations = 0;
		this.initializations = 0;
		this.keys = keys;
		this.context = new EvolvContextMock();

		this._listener;
		this._prefix = '';
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
		this._prefix = prefix;
		const keys = this.keys;
		const promise = new Promise((resolve, reject) => {
			resolve(true);
		});
		let that = this;
		promise.listen = function(listener) {
			that._listener = listener;
			listener({
				current: keys.filter(key => key.startsWith(prefix)),
				previous: []
			})
		};
		return promise;
	}

	fireActiveKeyListenerNewKeys(keys) {
		this._listener({
			current: keys.filter(key => key.startsWith(this._prefix)),
			previous: this.keys || []
		});
		this.keys = keys;
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
