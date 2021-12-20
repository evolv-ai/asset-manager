import { MiniPromise } from '@evolv/javascript-sdk';

export function injectScript(endpoint, env, version, uid) {
	return MiniPromise.createPromise(function(resolve, reject) {
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = endpoint + 'v' + version + '/' + env + '/' + uid + '/assets.js';
		script.defer = true;

		script.onload = resolve;
		script.onerror = reject;

		document.head.appendChild(script);
	});
}
