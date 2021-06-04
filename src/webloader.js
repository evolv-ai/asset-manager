import EvolvClient, {MiniPromise} from '@evolv/javascript-sdk';

import { generate } from './guids.js';
import EvolvAssetManager from './index.js';
import EvolvStorageManager from './storage.js';
import { modes } from './modes/index.js';
import { gaIntegration, isValidGaClientId } from './integrations/ga.js';


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

function injectScript(endpoint, env, version, uid) {
    return MiniPromise.createPromise(function (resolve, reject) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = endpoint + 'v' + version + '/' + env + '/' + uid + '/assets.js';
        script.defer = true;

        script.onload = resolve;
        script.onerror = reject;

        document.head.appendChild(script);
    });
}

function injectStylesheet(endpoint, env, version, uid) {
	const stylesheet = document.createElement('link');
	stylesheet.setAttribute('rel', 'stylesheet');
	stylesheet.setAttribute('type', 'text/css');
	stylesheet.setAttribute('href', endpoint + 'v' + version + '/' + env + '/' + uid + '/assets.css');

	document.head.appendChild(stylesheet);
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
		if (Event.prototype.constructor) {
			event = new CustomEvent(eventType, {});
		} else { // For IE Compatibility
			event = document.createEvent('Event');
			event.initEvent(eventType);
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
			const webloaderLoadEvent = new CustomEvent('webloader-loaded', {'detail': 	evolv.instancesCount });
			document.dispatchEvent(webloaderLoadEvent);
		} catch(e) {
			console.warn('Evolv: Could not fire custom event')
		}
	}

	if (evolv.instancesCount > 1) {
		console.warn('Multiple Evolv instances - please verify you have only loaded Evolv once');

		return true;
	}
}

function checkLazyUid(script) {
	const existingUid = window.localStorage.getItem('evolv:uid');
	if (script.dataset.evolvLazyUid && !existingUid) {
		if (!script.dataset.evolvUid || !isValidGaClientId(script.dataset.evolvUid)) {
			return true;
		}
	}

	return false;
}

function requireConsent(script) {
  return script.dataset.evolvRequireConsent === 'true'
}

function main() {
  window.evolv = window.evolv || {};
  const evolv = window.evolv;

  const script = currentScript();

  evolv.setUid = function setUid(lazyUid) {
    if (!lazyUid) {
      return;
    }

    script.dataset.evolvUid = lazyUid;
    main();
  };

	evolv.generateUid = function generateUid() {
		if (script.dataset.evolvLazyUid) {
			delete script.dataset.evolvLazyUid;
		}
		main();
	};

	// If evolvLazyUid is true and no uid is set - get GA client Id and set uid
	if (checkLazyUid(script)) {
		// Temporary hotfix for GA Client Id integration
		gaIntegration();
		return;
	}

	if (checkInstanceCount(evolv)) {
		return;
	}

	evolv.markConsented = function () {
		storageManager.allowPersistentStorage();
		evolv.client.allowEvents();
	};

	let storageManager = new EvolvStorageManager(script.dataset.evolvUseCookies, !requireConsent(script));

  if (!evolv.store) {
    evolv.store = storageManager.store.bind(storageManager);
  }

  if (!evolv.retrieve) {
    evolv.retrieve = storageManager.retrieve.bind(storageManager);
  }

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

	const scriptPromise = (js)
        ? injectScript(endpoint, env, version, uid)
        : MiniPromise.createPromise(function (resolve) { resolve(); });

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
			analytics: true,
      bufferEvents: requireConsent(script)
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
		handlePushState(client);
	}

	client.context.set('webloader.js', js);
	client.context.set('webloader.css', css);

	const assetManager = new EvolvAssetManager(client, {
		timeoutThreshold: script.dataset.evolvTimeout ? script.dataset.evolvTimeout - 0 : undefined,
        variantsLoaded: scriptPromise
	});

	Object.defineProperty(window.evolv, 'assetManager', {
		get: function () {
			return assetManager
		}
	});

	window.evolv.rerun = assetManager.rerun.bind(assetManager);
}

// If the user has requested not to be tracked, or the browser is older than ie11, bail out.
if ((!navigator.doNotTrack || navigator.doNotTrack === 'unspecified' || navigator.doNotTrack === '0') && typeof Map !== 'undefined') {
	main();
}
