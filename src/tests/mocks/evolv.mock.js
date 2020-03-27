class EvolvMock {
	constructor(keys=[]) {
		this.confirmations = 0;
		this.contaminations = 0;
		this.initializations = 0;
		this.keys = keys;
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
		promise.listen = function(f) {
			f(keys.filter(key => key.startsWith(prefix)))
		}
		return promise;
	}
}

export default EvolvMock;
