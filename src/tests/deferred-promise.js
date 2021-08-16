import { MiniPromise } from '@evolv/javascript-sdk';

export class DeferredPromise {
	constructor() {
		this.promise = MiniPromise.createPromise(function(resolve, reject) {
			this.resolve = resolve;
			this.reject = reject;
		}.bind(this));
	}

	then(onfulfilled, onrejected) {
		return this.promise.then(onfulfilled, onrejected);
	}

	catch(onrejected) {
		return this.promise.catch(onrejected);
	}

	finally(onfinally) {
		return this.promise.finally(onfinally);
	}
}
