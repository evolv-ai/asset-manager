import { MiniPromise } from '@evolv/javascript-sdk';

/**
 * @param {string} endpoint
 * @param {string} env
 * @param {number} version
 * @param {string} uid
 * @param {string} [cid]
 *
 * @returns {Promise | Promise<unknown> | MiniPromise}
 */
export function injectScript(endpoint, env, version, uid, cid) {
	return MiniPromise.createPromise(function(resolve, reject) {
		const queryParams = (cid) ? '?previewcid=' + cid : '';

		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = endpoint + 'v' + version + '/' + env + '/' + uid + '/assets.js' + queryParams;
		script.defer = true;

		script.onload = resolve;
		script.onerror = reject;

		document.head.appendChild(script);
	});
}
