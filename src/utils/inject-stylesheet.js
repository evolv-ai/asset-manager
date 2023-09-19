export const MAX_RETRIES = 3;
const MAX_REPLACE_TIME = 10000;

// Some React sites will remove the stylesheet from the DOM, so we need to re-insert it
/**
 * @param {string} endpoint
 * @param {string} env
 * @param {number} version
 * @param {string} uid
 * @param {string} [cid]
 *
 * @returns {void}
 */
export function injectStylesheetWithAutoReplace(endpoint, env, version, uid, cid, attempt = 0) {
	injectStylesheet(endpoint, env, version, uid, cid)
	const url = getStyleSheetUrl(endpoint, env, version, uid, cid);
	const cssFile = getCSSFile(url);

	if (cssFile && window.MutationObserver) {
		const observer = new window.MutationObserver(function (mutationList) {
			mutationList.forEach(function (mutation) {
				mutation.removedNodes.forEach(function (node) {
					if (node.nodeName === 'LINK' && node.href === url && attempt < MAX_RETRIES) {
						console.warn('Evolv AI: CSS removed, re-adding');
						observer.disconnect();
						injectStylesheetWithAutoReplace(endpoint, env, version, uid, cid, attempt + 1);
					}
				});
			});
		});
		observer.observe(getCSSFile(url).parentNode, {
			childList: true
		});

		setTimeout(function () {
			observer.disconnect();
		}, MAX_REPLACE_TIME);
	}
}

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
	const stylesheet = document.createElement('link');
	stylesheet.setAttribute('rel', 'stylesheet');
	stylesheet.setAttribute('type', 'text/css');
	stylesheet.setAttribute('href', getStyleSheetUrl(endpoint, env, version, uid, cid));

	document.head.appendChild(stylesheet);
}

function getStyleSheetUrl(endpoint, env, version, uid, cid) {
	const queryParams = (cid) ? '?previewcid=' + cid : '';
	return endpoint.replace(/\/$/, '') + '/v' + version + '/' + env + '/' + uid + '/assets.css' + queryParams;
}

function getCSSFile(url) {
	return document.querySelector('link[href="' + url + '"]')
}
