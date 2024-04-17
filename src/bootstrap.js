import EvolvClient, { MiniPromise } from '@evolv/client';

import { generate } from './guids.js';
import { EvolvAssetManager } from './asset-manager.js';
import EvolvStorageManager from './storage.js';
import { modes } from './modes/index.js';
import { objectAssign } from './shims/object-assign.js';
import firedEventsInitialization from './fired-events.js';
import { injectScript } from './utils/inject-script.js'
import { injectStylesheetWithAutoReplace } from './utils/inject-stylesheet.js'
import { addEngagementEmitter } from './engagement.js'


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

function handlePushState(client) {
	const pushStateOrig = history.pushState;
	const replaceStateOrig = history.replaceState;

	function updateContext() {
		client.context.set('web.url', window.location.href);
	}

	function handler(orig) {
		const args = Array.prototype.slice.call(arguments, 1);
		orig.apply(history, args);

		let event;
		const eventType = 'stateupdate_evolv';

		if (typeof CustomEvent === 'function') {
			event = new CustomEvent(eventType, {});
		} else { // For IE Compatibility
			event = document.createEvent('CustomEvent');
			event.initEvent(eventType, false, false, {});
		}

		window.dispatchEvent(event);
	}

	history.pushState = handler.bind(this, pushStateOrig);
	history.replaceState = handler.bind(this, replaceStateOrig);

	window.addEventListener('popstate', updateContext);
	window.addEventListener('stateupdate_evolv', updateContext);
}

function checkInstanceCount(evolv) {
	if (!evolv.instancesCount) {
		evolv.instancesCount = 1;
	} else {
		evolv.instancesCount++;
	}

	// Not works for IE, but it needs only in web-editor (chrome)
	if (window.CustomEvent) {
		try {
			const webloaderLoadEvent = new CustomEvent('webloader-loaded', { 'detail': evolv.instancesCount });
			document.dispatchEvent(webloaderLoadEvent);
		} catch (e) {
			console.warn('Evolv: Could not fire custom event')
		}
	}

	if (evolv.instancesCount > 1) {
		console.warn('Multiple Evolv instances - please verify you have only loaded Evolv once');

		return true;
	}
}

/**
 * @param {Config} config
 * @return {boolean}
 */
function checkLazyUid(config) {
	if (config.lazyUid) {
		if (!config.uid) {
			return true;
		}
	}

	return false;
}

/** @type {Config} */
export const defaultConfig = {
	environment: undefined,
	endpoint: 'https://participants.evolv.ai/',
	uid: undefined,
	lazyUid: false,
	requireConsent: false,
	useCookies: undefined,
	js: true,
	css: true,
	pushstate: false,
	timeout: undefined,
	debug: false
};

/**
 * @param {Partial<Config>} initialConfig
 */
export function bootstrap(initialConfig) {
	window.evolv = window.evolv || {};
	const evolv = window.evolv;

	/** @type Config */
	const config = objectAssign({}, defaultConfig, initialConfig);

	evolv.setUid = function setUid(lazyUid) {
		if (!lazyUid) {
			return;
		}

		if (evolv.context) {
			console.warn('Evolv: Cannot set UID because another client instance already exists');
			return;
		}

		config.uid = lazyUid;
		bootstrap(config);
	};

	evolv.onSsrClientInitialized = function onSsrClientInitialized() {
		if (evolv.ssrInititialized) {
			console.info('Evolv: Client from SSR has already been initialized. Ignoring this call');

			return;
		}

		evolv.ssrInititialized = true;
		console.info('Evolv: Client from SSR has initialized. Proceeding with bootstrapping');
		bootstrap(config);
	}

	if (window.evolv.ssr && !window.evolv.client) {
		console.info('Evolv: Deferring client initialization to SSR client');
		return;
	}

	// If evolvLazyUid is true and no uid is set
	if (checkLazyUid(config)) {
		return;
	}

	if (checkInstanceCount(evolv)) {
		return;
	}

	evolv.markConsented = function() {
		storageManager.allowPersistentStorage();
		evolv.client.allowEvents();
	};

	let storageManager = new EvolvStorageManager(config.useCookies, !config.requireConsent);

	if (!evolv.store) {
		evolv.store = storageManager.store.bind(storageManager);
	}

	if (!evolv.retrieve) {
		evolv.retrieve = storageManager.retrieve.bind(storageManager);
	}

	modes.forEach(function(mode) {
		return mode.shouldActivate(config.environment) && mode.activate();
	});

	const blockExecution = window.sessionStorage.getItem('evolv:blockExecution');
	if (blockExecution === 'true') {
		return;
	}

	const candidateToken = window.sessionStorage.getItem('evolv:candidateToken');
	const env = candidateToken || config.environment;
	const previewCid = candidateToken
		? undefined
		: window.sessionStorage.getItem('evolv:previewCid');

	const version = 1;

	let js = !!candidateToken || config.js;
	let css = !!candidateToken || config.css;
	let pushstate = config.pushstate;
	let endpoint = config.endpoint;
	const debug = config.debug;

	const uid = evolv.context
		? evolv.context.uid
		: config.uid || ensureId(evolv, 'uid', false);

	const scriptPromise = (js)
		? injectScript(endpoint, env, version, uid, previewCid)
		: MiniPromise.createPromise(function(resolve) {
			resolve();
		});

	scriptPromise.then(function() {
		document.documentElement.dataset.evolvJs = 'ready';
	}).catch(function() {
		document.documentElement.dataset.evolvJs = 'errored';
	});

	if (css) {
		injectStylesheetWithAutoReplace(endpoint, env, version, uid, previewCid);
	}

	let client = evolv.client;

	if (!client) {
		let options = {
			debug: debug,
			environment: env,
			endpoint: endpoint,
			version: version,
			autoConfirm: false,
			analytics: true,
			bufferEvents: config.requireConsent,
			clientName: 'asset-manager',
			hooks: {
				beforeOptions: function(opts) {
					return (previewCid)
						? objectAssign(opts, {
							url: opts.url + '?previewcid=' + previewCid
						})
						: opts;
				}
			}
		};
		client = new EvolvClient(options);
		client.initialize(uid);
		Object.defineProperty(window.evolv, 'client', {
			get: function() {
				return client
			}
		});
		Object.defineProperty(window.evolv, 'context', {
			get: function() {
				return client.context
			}
		});
	}

	if (pushstate) {
		// Handling for single-page applications
		handlePushState(client);
	}

	firedEventsInitialization(client);

	client.context.set('webloader.js', js);
	client.context.set('webloader.css', css);

	const assetManager = new EvolvAssetManager(client, {
		timeoutThreshold: config.timeout,
		variantsLoaded: scriptPromise,
		debug: config.debug
	});

	Object.defineProperty(window.evolv, 'assetManager', {
		get: function() {
			return assetManager
		}
	});

	window.evolv.rerun = assetManager.rerun.bind(assetManager);

	addEngagementEmitter(client);
}
