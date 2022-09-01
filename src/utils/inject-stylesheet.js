/**
 * @param {string} endpoint
 * @param {string} env
 * @param {number} version
 * @param {string} uid
 * @param {string} [cid]
 *
 * @returns {void}
 */
export function injectStylesheet(endpoint, env, version, uid, cid) {
	const queryParams = (cid) ? '?previewcid=' + cid : '';

	const stylesheet = document.createElement('link');
	stylesheet.setAttribute('rel', 'stylesheet');
	stylesheet.setAttribute('type', 'text/css');
	stylesheet.setAttribute('href', endpoint.replace(/\/$/, '') + '/v' + version + '/' + env + '/' + uid + '/assets.css' + queryParams);

	document.head.appendChild(stylesheet);
}
