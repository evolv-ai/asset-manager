import EvolvClient from '@evolv/javascript-sdk';

import { generate } from './guids.js';
import EvolvAssetManager from './index.js';
import { modes } from './modes/index.js';


function ensureId(evolv, key, session) {
	let id;
	if (evolv.context && key in evolv.context) {
		id = evolv[key];
	} else {
		id = evolv.retrieve(key, session);
		if (!id) {
			id = generate();
			evolv.store(key, id, session);
		}
	}
	return id;
}

function currentScript() {
	if (document.currentScript) {
		return document.currentScript;
	}

	for (let i = 0; i < document.scripts.length; i++) {
		const script = document.scripts[i];
		if (script && script.dataset && 'evolvEnvironment' in script.dataset) {
			return script;
		}
	}

	throw new Error('[Evolv] Environment not specified');
}

function injectScript(endpoint, env, version, uid) {
	const script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = endpoint + 'v' + version + '/' + env + '/' + uid + '/assets.js';
	script.defer = true;

	document.head.appendChild(script);
}

function injectStylesheet(endpoint, env, version, uid) {
	const stylesheet = document.createElement('link');
	stylesheet.setAttribute('rel', 'stylesheet');
	stylesheet.setAttribute('type', 'text/css');
	stylesheet.setAttribute('href', endpoint + 'v' + version + '/' + env + '/' + uid + '/assets.css');

	document.head.appendChild(stylesheet);
}

function main() {
	window.evolv = window.evolv || {};

	const evolv = window.evolv;

	if (!evolv.store) {
		evolv.store = function (key, value, session) {
			(session ? window.sessionStorage : window.localStorage).setItem('evolv:' + key, value);
		}
	}

	if (!evolv.retrieve) {
		window.evolv.retrieve = function (key, session) {
			return (session ? window.sessionStorage : window.localStorage).getItem('evolv:' + key);
		}
	}

	modes.forEach(function(mode) { 
		return mode.shouldActivate() && mode.activate() 
	});
	
	const candidateToken = evolv.retrieve('candidateToken', true);

	const script = currentScript();
	const env = candidateToken || script.dataset.evolvEnvironment;
	
	const version = 1;

	let js = script.dataset.evolvJs;
	let css = script.dataset.evolvCss;
	let endpoint = script.dataset.evolvEndpoint || 'https://participants.evolv.ai/';

	const uid = script.dataset.evolvUid || ensureId(evolv, 'uid', false);
	const sid = script.dataset.evolvSid || ensureId(evolv, 'sid', true);

	js = !!candidateToken || !js || js === 'true';
	css = !!candidateToken || !css || css === 'true';

	if (js) {
		injectScript(endpoint, env, version, uid);
	}

	if (css) {
		injectStylesheet(endpoint, env, version, uid);
	}

	let client = evolv.client;
	if (!client) {
		let options = {
			environment: env,
			endpoint: endpoint,
			version: version,
			autoConfirm: false
		};
		client = new EvolvClient(options);
		client.initialize(uid, sid);
		Object.defineProperty(window.evolv, 'client', {
			get: function () {
				return client
			}
		});
		Object.defineProperty(window.evolv, 'context', {
			get: function () {
				return client.context
			}
		});
	}

	client.context.set('webloader.js', js);
	client.context.set('webloader.css', css);

	const assetManager = new EvolvAssetManager(client);

	Object.defineProperty(window.evolv, 'assetManager', {
		get: function () {
			return assetManager
		}
	});
}

// If the user has requested not to be tracked, or the browser is older than ie11, bail out.
if ((!navigator.doNotTrack || navigator.doNotTrack === 'unspecified' || navigator.doNotTrack === '0') && typeof Map !== 'undefined') {
	main();
}
