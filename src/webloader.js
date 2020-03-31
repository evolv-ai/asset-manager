import { generate } from './guids.js';
import EvolvAssetManager from './index.js';
import EvolvClient from "@evolv/javascript-sdk";


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
		if (script && script.dataset && 'env' in script.dataset) {
			return script;
		}
	}
}

function injectScript(endpoint, env, uid) {
	const script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = endpoint + '/' + env + '/' + uid + '/assets.js';

	document.head.appendChild(script);
}

function injectStylesheet(endpoint, env, uid) {
	const stylesheet = document.createElement('link');
	stylesheet.setAttribute('rel', 'stylesheet');
	stylesheet.setAttribute('type', 'text/css');
	stylesheet.setAttribute('href', endpoint + '/' + env + '/' + uid + '/assets.css');

	document.head.appendChild(stylesheet);
}

function main() {
	if (!window.evolv) {
		window.evolv = {};
	}

	const evolv = window.evolv;

	if (!evolv.store) {
		evolv.store = function (key, value, session) {
			(session ? window.sessionStorage : window.localStorage).setItem('evolv_' + key, value);
		}
	}

	if (!evolv.retrieve) {
		window.evolv.retrieve = function (key, session) {
			return (session ? window.sessionStorage : window.localStorage).getItem('evolv_' + key);
		}
	}

	const script = currentScript();
	const env = script.dataset.env;
	let js = script.dataset.js;
	let css = script.dataset.css;
	let endpoint = script.dataset.endpoint || 'https://participants.evolv.ai/v1';
	if (!env) {
		throw new Error('Evolv: Environment not specified');
	}
	const uid = script.dataset.uid || ensureId(evolv, 'uid', false);
	const sid = script.dataset.sid || ensureId(evolv, 'sid', true);

	js = !js || js === 'true';
	css = !css || css === 'true';

	if (js) {
		injectScript(endpoint, env, uid);
	}

	if (css) {
		injectStylesheet(endpoint, env, uid);
	}

	let client = evolv.client;
	if (!client) {
		let options = {
			env: env,
			endpoint: endpoint
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
if (!window.doNotTrack && typeof Map !== 'undefined') {
	main();
}
