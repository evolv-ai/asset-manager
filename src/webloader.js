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

function handlePushstate(client) {
	const pushStateOrig = history.pushState;

	history.pushState = function() {
		const args = Array.prototype.slice.call(arguments);
		pushStateOrig.apply(history, args);
	
		let event;
		const eventType = 'pushstate_evolv';
	
		if (Event.prototype.constructor) {
			event = new CustomEvent(eventType, {});
		} else { // For IE Compatibility
			event = document.createEvent('Event');
			event.initEvent(eventType);
		}
	
		window.dispatchEvent(event);
	};

	const updateContext = function () {
		client.context.set('web.url', window.location.href);
	};

	window.addEventListener('popstate', updateContext);
	window.addEventListener('pushstate_evolv', updateContext);
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

	const script = currentScript();

	modes.forEach(function(mode) {
		return mode.shouldActivate(script.dataset.evolvEnvironment) && mode.activate();
	});
	
	const candidateToken = evolv.retrieve('candidateToken', true);
	const env = candidateToken || script.dataset.evolvEnvironment;
	
	const version = 1;

	let js = script.dataset.evolvJs;
	let css = script.dataset.evolvCss;
	let pushstate = script.dataset.evolvPushstate;
	let endpoint = script.dataset.evolvEndpoint || 'https://participants.evolv.ai/';

	const uid = script.dataset.evolvUid || ensureId(evolv, 'uid', false);
	const sid = script.dataset.evolvSid || ensureId(evolv, 'sid', true);

	js = !!candidateToken || !js || js === 'true';
	css = !!candidateToken || !css || css === 'true';
	pushstate = pushstate && pushstate === 'true';

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
			autoConfirm: false,
			analytics: true
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

	if (pushstate) {
		// Handling for single-page applications
		handlePushstate(client);
	}

	client.context.set('webloader.js', js);
	client.context.set('webloader.css', css);

	const assetManager = new EvolvAssetManager(client, {
		timeoutThreshold: script.dataset.evolvTimeout ? script.dataset.evolvTimeout - 0 : undefined
	});

	Object.defineProperty(window.evolv, 'assetManager', {
		get: function () {
			return assetManager
		}
	});

	window.evolv.rerun = function(prefix) {
		client.clearActiveKeys(prefix);
		client.reevaluateContext();
	}
}

// If the user has requested not to be tracked, or the browser is older than ie11, bail out.
if ((!navigator.doNotTrack || navigator.doNotTrack === 'unspecified' || navigator.doNotTrack === '0') && typeof Map !== 'undefined') {
	main();
}
