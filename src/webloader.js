import { bootstrap } from './bootstrap.js';


function isEvolvScript(script) {
	return script && script.dataset && 'evolvEnvironment' in script.dataset;
}

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

// If the user has requested not to be tracked, or the browser is older than ie11, bail out.
if ((!navigator.doNotTrack || navigator.doNotTrack === 'unspecified' || navigator.doNotTrack === '0') && typeof Map !== 'undefined') {
	const script = currentScript();
	const config = buildConfig(script.dataset);

	bootstrap();
}
