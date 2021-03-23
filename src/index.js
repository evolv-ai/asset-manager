import all from './all.js';
import { MiniPromise } from '@evolv/javascript-sdk';
import { toContextKey } from './keys.js';
import { isImmediate, isOnDomContentLoaded, isOnPageLoaded, isLegacy } from './guards.js';
import { scheduleOnDOMContentLoaded, scheduleOnLoad } from './schedule.js';

const MAX_TIMEOUT = 100;

function main(client, options, _performance) {
	let appliedClasses = [];
	let confirmed = false;
	options = options || {};

	function retrieveEvolvCssAsset(environment) {
		return document.querySelector('link[href *= "' + environment + '"][href *= "assets.css"]');
	}

	function retrieveEvolvJsAsset(environment) {
		return document.querySelector('script[src *= "' + environment + '"][src *= "assets.js"]');
	}

	function confirm() {
		if (!confirmed) {
			client.confirm();
			confirmed = true;
		}
	}

  function runImmediately(variants, functions, subset) {
    let promises = [];
    functions
      .forEach(function (key) {
        const contextKey = toContextKey(key);
        if (subset && subset.indexOf(contextKey) > -1) {
          return;
        }

        if (key in variants) {
          let promise = MiniPromise.createPromise(function (resolve, reject) {
            try {
              if (!variants[key].call({key: contextKey}, resolve, reject)) {
                resolve();
              }
            } catch (err) {
              reject(err);
            }
          });
          promises.push(promise);
        }
      });

    return promises;
  }

  const onReject = function (err) {
    client.contaminate({
      reason: 'error-thrown',
      details: err.message
    });

    console.warn('[Evolv]: An error occurred while applying a javascript mutation. ' + err);
  };

  const invokeFunctions = function(subset, functions, script) {
    _invokeFunctionsLegacy(subset, functions);

    _invokeFunctions(subset, functions, script);
  };

  const checkTimeout = function() {
    const timeNow = (new Date()).getTime();
    const domContentLoadedEventStart = (_performance || performance).timing.domContentLoadedEventStart;
    const threshold = options.timeoutThreshold || 60000;
    if (domContentLoadedEventStart > 0 && timeNow > domContentLoadedEventStart + threshold) {
      client.contaminate({
        reason: 'timeout-exceeded',
        details: 'current time: ' + timeNow + ', domContentLoadedEventStart: ' + domContentLoadedEventStart + ', threshold: ' + threshold
      });
      console.warn('[Evolv]: Loading of variants timed out.');

      return true;
    }
  };

  let applyTimeout = true;
  let onloadFunctionCalls = [];
  const _invokeFunctions = function(subset, functions, script) {
    let evolv = window.evolv;

    if (!evolv || !evolv.javascript || !evolv.javascript.variants) {
      onloadFunctionCalls.push({
        subset: subset,
        functions: functions,
        script: script
      });

      script.onload = function () {
        for (let i = 0; i < onloadFunctionCalls.length; i++) {
          const onloadFunctionCall = onloadFunctionCalls[i];
          _invokeFunctions(onloadFunctionCall.subset, onloadFunctionCall.functions, onloadFunctionCall.script);
        }
        onloadFunctionCalls = [];
      };

      return;
    }

    if (applyTimeout && checkTimeout()) {
      applyTimeout = false;
      return;
    }

    const immediateFunctions = functions.filter(isImmediate(evolv.javascript.variants));
    const domContentLoadedFunctions = functions.filter(isOnDomContentLoaded(evolv.javascript.variants));
    const pageLoadedFunctions = functions.filter(isOnPageLoaded(evolv.javascript.variants));

    const promises = runImmediately(evolv.javascript.variants, immediateFunctions, subset);

    domContentLoadedFunctions // TODO move the listener outside the loop
      .forEach(function (key) {
        const fn = evolv.javascript.variants[key];

        const contextKey = toContextKey(key);

        if (subset && subset.indexOf(contextKey) > -1) {
          return;
        }

        scheduleOnDOMContentLoaded(fn, contextKey)
          .catch(onReject);
      });

    pageLoadedFunctions // TODO move the listener outside the loop
      .forEach(function (key) {
        const fn = evolv.javascript.variants[key];

        const contextKey = toContextKey(key);

        if (subset && subset.indexOf(contextKey) > -1) {
          return;
        }

        scheduleOnLoad(fn, contextKey)
          .catch(onReject);
      });

    all(promises).then(function () {
      promises.length > 0 && confirm(); // TODO problems if all the functions are not immediate -- will not confirm
    })
      .catch(onReject)
      .finally(function() {
        applyTimeout = false;
      });
  };

  let applyTimeoutLegacy = true;
	const _invokeFunctionsLegacy = function(subset, functions) {
    const evolv = window.evolv;
		if (typeof evolv === 'undefined' || !evolv.javascript || !evolv.javascript.variants) {
      const domContentLoadedEventStart = (_performance || performance).timing.domContentLoadedEventStart;
			if (domContentLoadedEventStart > 0) {
        if (applyTimeoutLegacy && checkTimeout()) {
          applyTimeoutLegacy = false;
          return;
        }
      }

      setTimeout(function () {
        _invokeFunctionsLegacy(subset, functions);
      }, MAX_TIMEOUT);

			return;
		}

    const legacyFunctions = functions.filter(isLegacy(evolv.javascript.variants));
    const promises = runImmediately(evolv.javascript.variants, legacyFunctions, subset);

    all(promises).then(function () {
      promises.length > 0 && confirm();
		})
      .catch(onReject)
      .finally(function() {
        applyTimeout = false;
      });
	};

	client.getActiveKeys('web').listen(function (keys) {
		const environment = client.environment;
		const cssAsset = retrieveEvolvCssAsset(environment);
		const jsAsset = retrieveEvolvJsAsset(environment);

		const liveContexts = keys.current
			.map(function (key) {
				return 'evolv_'.concat(key.replace(/\./g, '_'));
			})
			.sort(function (a, b) {
				return a.length - b.length;
			});

		appliedClasses.forEach(function (c) {
			document.documentElement.classList.remove(c);
		});

		if (cssAsset) {
			liveContexts.forEach(function (c) {
				document.documentElement.classList.add(c);
			});
			appliedClasses = liveContexts.slice();
		}

		if (jsAsset && liveContexts.length > 0) {
        invokeFunctions(keys.previous, liveContexts, jsAsset);
		} else if (cssAsset && liveContexts.length > 0) {
			confirm();
		}
	});
}

function EvolvAssetManager(client, options, performance) {
	client.context.set('web.url', window.location.href);

	// Expose client and context proprties
	Object.defineProperty(this, 'client', { get: function () { return client }});
	Object.defineProperty(this, 'context', { get: function () { return client.context }});

	main(client, options, performance);
}

export default EvolvAssetManager;
