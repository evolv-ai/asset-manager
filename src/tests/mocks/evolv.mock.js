const keysDict = {
	'web.page1.redirectToGoogle': {
		target_url: 'https://google.com',
		include_query_parameters: false
	},
	'web.page1.redirectToEvolv': {
		target_url: 'https://evolv.ai',
		include_query_parameters: false
	},
	'web.page1.redirectPartialPath': {
		target_url: '/goods',
		include_query_parameters: false
	},
	'web.page1.redirectPartialPathWithParams': {
		target_url: '/goods',
		include_query_parameters: true
	},
	'web.page1.redirectWithParams': {
		target_url: 'https://evolv.ai/',
		include_query_parameters: true
	},
	'web.page1.redirectToHttp': {
		target_url: 'http://info.cern.ch/',
		include_query_parameters: false
	},
	'web.page1.redirectGoogleWithoutHttp': {
		target_url: 'google.com',
		include_query_parameters: false
	}
}

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
		return new Promise(function(resolve){
			resolve();
		})
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
	on(){}

	get(key){
		if(keysDict[key]){
			return new Promise((resolve) => (resolve({
				type: 'redirect',
				...keysDict[key]
			})));
		}
		return new Promise((_, reject) => reject(null));
	}
}

class EvolvContextMock {
	constructor(values, local) {
		this.values = values || {};
		this.localContext = local || {};
	}

	set(key, value, local) {
		this.values[key] = value;
		if(local) {
			this.localContext[key] = value
		}
		return true;
	}
}

export default EvolvMock;
