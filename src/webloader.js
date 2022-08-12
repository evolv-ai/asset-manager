import { bootstrap } from './bootstrap.js';
import { buildConfig } from './build-config.js';


/**
 * @param {HTMLScriptElement} script
 * @return {boolean}
 */
function isEvolvScript(script) {
	return script && (script.dataset && 'evolvEnvironment' in script.dataset
		|| hasEnvironmentInQueryParam(script));
}

function hasEnvironmentInQueryParam(script) {
	const regex = /[?&]environment=([^&]+)/;
	let matches = script.src.match(regex);

	return (matches && matches.length) ? matches[1] : false;
}

function ensureEnvironmentOnDataset(script) {
	script.dataset.evolvEnvironment = script.dataset.evolvEnvironment || hasEnvironmentInQueryParam(script);

	return script.dataset;
}

/**
 * @return {HTMLScriptElement}
 */
function currentScript() {
	if (document.currentScript && isEvolvScript(document.currentScript)) {
		return document.currentScript;
	}

	for (let i = 0; i < document.scripts.length; i++) {
		const script = document.scripts[i];
		if (isEvolvScript(script)) {
			return script;
		}
	}

	throw new Error('[Evolv] Environment not specified');
}

export function initialize(callback) {
	// If the user has requested not to be tracked, or the browser is older than ie11, bail out.
	if ((!navigator.doNotTrack || navigator.doNotTrack === 'unspecified' || navigator.doNotTrack === '0') && typeof Map !== 'undefined') {
		const script = currentScript();
		const dataset =  ensureEnvironmentOnDataset(script);
		const config = buildConfig(dataset);

		bootstrap(config);

		if (callback) {
			callback(config);
		}
	}
}
