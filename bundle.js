var EvolvAssetManager = (function () {
	'use strict';

	var isMergeableObject = function isMergeableObject(value) {
		return isNonNullObject(value)
			&& !isSpecial(value)
	};

	function isNonNullObject(value) {
		return !!value && typeof value === 'object'
	}

	function isSpecial(value) {
		var stringValue = Object.prototype.toString.call(value);

		return stringValue === '[object RegExp]'
			|| stringValue === '[object Date]'
			|| isReactElement(value)
	}

	// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
	var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
	var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

	function isReactElement(value) {
		return value.$$typeof === REACT_ELEMENT_TYPE
	}

	function emptyTarget(val) {
		return Array.isArray(val) ? [] : {}
	}

	function cloneUnlessOtherwiseSpecified(value, options) {
		return (options.clone !== false && options.isMergeableObject(value))
			? deepmerge(emptyTarget(value), value, options)
			: value
	}

	function defaultArrayMerge(target, source, options) {
		return target.concat(source).map(function(element) {
			return cloneUnlessOtherwiseSpecified(element, options)
		})
	}

	function getMergeFunction(key, options) {
		if (!options.customMerge) {
			return deepmerge
		}
		var customMerge = options.customMerge(key);
		return typeof customMerge === 'function' ? customMerge : deepmerge
	}

	function getEnumerableOwnPropertySymbols(target) {
		return Object.getOwnPropertySymbols
			? Object.getOwnPropertySymbols(target).filter(function(symbol) {
				return target.propertyIsEnumerable(symbol)
			})
			: []
	}

	function getKeys(target) {
		return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
	}

	function propertyIsOnObject(object, property) {
		try {
			return property in object
		} catch(_) {
			return false
		}
	}

	// Protects from prototype poisoning and unexpected merging up the prototype chain.
	function propertyIsUnsafe(target, key) {
		return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
			&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
				&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
	}

	function mergeObject(target, source, options) {
		var destination = {};
		if (options.isMergeableObject(target)) {
			getKeys(target).forEach(function(key) {
				destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
			});
		}
		getKeys(source).forEach(function(key) {
			if (propertyIsUnsafe(target, key)) {
				return
			}

			if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
				destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
			} else {
				destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
			}
		});
		return destination
	}

	function deepmerge(target, source, options) {
		options = options || {};
		options.arrayMerge = options.arrayMerge || defaultArrayMerge;
		options.isMergeableObject = options.isMergeableObject || isMergeableObject;
		// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
		// implementations can use it. The caller may not replace it.
		options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

		var sourceIsArray = Array.isArray(source);
		var targetIsArray = Array.isArray(target);
		var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

		if (!sourceAndTargetTypesMatch) {
			return cloneUnlessOtherwiseSpecified(source, options)
		} else if (sourceIsArray) {
			return options.arrayMerge(target, source, options)
		} else {
			return mergeObject(target, source, options)
		}
	}

	deepmerge.all = function deepmergeAll(array, options) {
		if (!Array.isArray(array)) {
			throw new Error('first argument should be an array')
		}

		return array.reduce(function(prev, next) {
			return deepmerge(prev, next, options)
		}, {})
	};

	var deepmerge_1 = deepmerge;

	var cjs = deepmerge_1;

	const deepMerge = cjs;
	function deepClone(obj) {
	  return JSON.parse(JSON.stringify(obj));
	}

	/**
	 * Check if a variable is an Object. This function considers Null and Array to not be Objects.
	 *
	 * @param variable The variable that is to tested
	 * @returns {boolean} True if the variable is an object
	 */
	function isObject(variable) {
	  return typeof variable === 'object' && variable !== null && !Array.isArray(variable);
	}

	/**
	 * Convert a hierarchical map into a flattened map
	 *
	 * @param {Object} map A map with hierarchical keys
	 * @returns {Object} A map with hierarchical keys flattened
	 */
	function flatten(map, filter) {
	  function recurse(current, parent_key) {
	    let items = {};
	    Object.keys(current).filter(filter || function() { return true; }).forEach(function(k) {
	      let v = current[k];
	      let new_key = parent_key ? (parent_key + '.' + k) : k;
	      if (isObject(v)) {
	        items = assign(items, recurse(current[k], new_key));
	      } else {
	        items[new_key] = v;
	      }
	    });

	    return items;
	  }

	  return recurse(map, '');
	}

	function flattenKeys(map, filter) {
	  function recurse(current, parent_key) {
	    let items = [];
	    Object.keys(current).filter(filter || function() { return true; }).forEach(function(k) {
	      let v = current[k];
	      let new_key = parent_key ? (parent_key + '.' + k) : k;
	      items.push(new_key);
	      if (isObject(v)) {
	        items = items.concat(recurse(current[k], new_key));
	      }
	    });

	    return items;
	  }

	  return recurse(map, '');
	}

	function removeValueForKey(key, map) {
	  function recurse(keys, index, map) {
	    let key = keys[index];
	    if (index === (keys.length - 1)) {
	      delete map[key];
	      return true;
	    }

	    if (!(key in map)) {
	      return false;
	    }

	    if (recurse(keys, index + 1, map[key]) && Object.keys(map[key]).length === 0) {
	      delete map[key];
	      return true;
	    }
	  }

	  return recurse(key.split('.'), 0, map);
	}

	function getValueForKey(key, map) {
	  let value;
	  let current = map;
	  let keys = key.split('.');
	  for (let i = 0; i < keys.length; i++) {
	    let k = keys[i];
	    if (i === (keys.length - 1)) {
	      value = current[k];
	      break;
	    }

	    if (!(k in current)) {
	      break;
	    }

	    current = current[k];
	  }

	  return value;
	}

	function setKeyToValue(key, value, map) {
	  let current = map;
	  let keys = key.split('.');
	  for (let i = 0; i < keys.length; i++) {
	    let k = keys[i];
	    if (i === (keys.length - 1)) {
	      current[k] = value;
	      break;
	    }

	    if (!(k in current)) {
	      current[k] = {};
	    }

	    current = current[k];
	  }

	  return value;
	}

	/**
	 * Convert a flattened map into a hierarchical map
	 *
	 * @param {Object} map A map with hierarchical keys flattened
	 * @returns {Object} A map with hierarchical keys
	 */
	function expand(map) {
	  let expanded = {};
	  Object.keys(map).forEach(function(key) {
	    let v = map[key];
	    setKeyToValue(key, v, expanded);
	  });

	  return expanded;
	}

	function filter(map, active) {
	  const flattened = flatten(map);
	  const filtered = {};
	  active.forEach(function(key) {
	    if (key in flattened) {
	      filtered[key] = flattened[key];
	    }
	  });

	  return expand(filtered);
	}

	function assign(target, sources) {
	  if (Object.assign) {
	    return Object.assign.apply(undefined, arguments);
	  }

	  if (target === null || target === undefined) {
	    throw new TypeError('Cannot convert undefined or null to object');
	  }

	  const to = Object(target);

	  for (let index = 1; index < arguments.length; index++) {
	    let nextSource = arguments[index];

	    if (nextSource !== null && nextSource !== undefined) {
	      for (let nextKey in nextSource) {
	        // Avoid bugs when hasOwnProperty is shadowed
	        if (nextSource.hasOwnProperty(nextKey)) {
	          to[nextKey] = nextSource[nextKey];
	        }
	      }
	    }
	  }

	  return to;
	}

	const scopedHandlers = new Map();
	const scopedOnceHandlers = new Map();
	const scopedPayloads = new Map();

	function ensureScope(scope) {
	  if (scopedHandlers.has(scope)) {
	    return;
	  }

	  scopedHandlers.set(scope, {});
	  scopedOnceHandlers.set(scope, {});
	  scopedPayloads.set(scope, {});
	}

	function destroyScope(scope) {
	  scopedHandlers.delete(scope);
	  scopedOnceHandlers.delete(scope);
	  scopedPayloads.delete(scope);
	}

	function waitFor(scope, it, handler) {
	  ensureScope(scope);

	  const handlers = scopedHandlers.get(scope);
	  const payloads = scopedPayloads.get(scope);

	  if (!handlers[it]) {
	    handlers[it] = [handler];
	  } else {
	    handlers[it].push(handler);
	  }

	  if (payloads[it]) {
	    handler.apply(undefined, payloads[it]);
	  }
	}

	function waitOnceFor(scope, it, handler) {
	  ensureScope(scope);

	  const onceHandlers = scopedOnceHandlers.get(scope);
	  const payloads = scopedPayloads.get(scope);

	  if (payloads[it]) {
	    handler.apply(undefined, payloads[it]);
	    return;
	  }

	  if (!onceHandlers[it]) {
	    onceHandlers[it] = [handler];
	  } else {
	    onceHandlers.push(handler);
	  }
	}

	function emit(scope, it) {
	  ensureScope(scope);

	  const handlers = scopedHandlers.get(scope);
	  const onceHandlers = scopedOnceHandlers.get(scope);
	  const payloads = scopedPayloads.get(scope);

	  const payload = [].slice.call(arguments);
	  payload.shift();
	  payloads[it] = payload;

	  const oh = onceHandlers[it];
	  while (oh && oh.length) {
	    let handler = oh.shift();
	    try {
	      handler.apply(undefined, payload);
	    } catch (err) {
	      console.error(err);
	      console.log('Failed to invoke one time handler of %s', it);
	    }
	  }

	  const handlersForIt = handlers[it];
	  if (!handlersForIt) {
	    return;
	  }
	  handlersForIt.forEach(function(h) {
	    try {
	      h.apply(undefined, payload);
	    } catch (err) {
	      console.error(err);
	      console.log('Failed to invoke handler of %s', it);
	    }
	  });
	}

	const CONTEXT_CHANGED = 'context.changed';
	const CONTEXT_INITIALIZED = 'context.initialized';
	const CONTEXT_VALUE_REMOVED = 'context.value.removed';
	const CONTEXT_VALUE_ADDED = 'context.value.added';
	const CONTEXT_VALUE_CHANGED = 'context.value.changed';
	const CONTEXT_DESTROYED = 'context.destroyed';

	/**
	 * The EvolvContext provides functionality to manage data relating to the client state, or context in which the
	 * variants will be applied.
	 *
	 * This data is used for determining which variables are active, and for general analytics.
	 *
	 * @constructor
	 */
	function EvolvContext() {
	  let uid;
	  let sid;
	  let remoteContext;
	  let localContext;
	  let initialized = false;

	  /**
	   * A unique identifier for the participant.
	   */
	  Object.defineProperty(this, 'uid', { get: function() { return uid; } });

	  /**
	   * A unique identifier for the current session of the participant.
	   */
	  Object.defineProperty(this, 'sid', { get: function() { return sid; } });

	  /**
	   * The context information for evaluation of predicates and analytics.
	   */
	  Object.defineProperty(this, 'remoteContext', { get: function() { return deepClone(remoteContext); } });

	  /**
	   * The context information for evaluation of predicates only, and not used for analytics.
	   */
	  Object.defineProperty(this, 'localContext', { get: function() { return deepClone(localContext); } });

	  function mutableResolve() {
	    return deepMerge(localContext, remoteContext);
	  }

	  function ensureInitialized() {
	    if (!initialized) {
	      throw new Error('Evolv: The evolv context is not initialized')
	    }
	  }

	  this.initialize = function(_uid, _sid, _remoteContext, _localContext) {
	    if (initialized) {
	      throw new Error('Evolv: The context is already initialized');
	    }
	    uid = _uid;
	    sid = _sid;
	    remoteContext = _remoteContext ? deepClone(_remoteContext) : {};
	    localContext = _localContext ? deepClone(_localContext) : {};
	    initialized = true;
	    emit(this, CONTEXT_INITIALIZED, this.resolve());
	  };

	  this.destroy = function() {
	    remoteContext = undefined;
	    localContext = undefined;
	    emit(this, CONTEXT_DESTROYED, this);
	  };

	  /**
	   * Computes the effective context from the local and remote contexts.
	   *
	   * @returns {Object} The effective context from the local and remote contexts.
	   */
	  this.resolve = function() {
	    ensureInitialized();
	    return deepClone(mutableResolve());
	  };

	  /**
	   * Sets a value in the current context.
	   *
	   * This will cause the effective genome to be recomputed.
	   *
	   * @param key {String} The key to associate the value to.
	   * @param value {*} The value to associate with the key.
	   * @param local {Boolean} If true, the value will only be added to the localContext.
	   */
	  this.set = function(key, value, local) {
	    ensureInitialized();
	    const context = local ? localContext : remoteContext;
	    const before = getValueForKey(key, context);
	    setKeyToValue(key, value, context);

	    const updated = this.resolve();
	    if (typeof before === 'undefined') {
	      emit(this, CONTEXT_VALUE_ADDED, key, value, local, updated);
	    } else {
	      emit(this, CONTEXT_VALUE_CHANGED, key, value, before, local, updated);
	    }
	    emit(this, CONTEXT_CHANGED, updated);
	  };

	  /**
	   * Remove a specified key from the context.
	   *
	   * This will cause the effective genome to be recomputed.
	   *
	   * @param key {String} The key to remove from the context.
	   */
	  this.remove = function(key) {
	    ensureInitialized();
	    const local = removeValueForKey(key, localContext);
	    const remote = removeValueForKey(key, remoteContext);
	    const removed = local || remote;

	    if (removed) {
	      const updated = this.resolve();
	      emit(this, CONTEXT_VALUE_REMOVED, key, !remote, updated);
	      emit(this, CONTEXT_CHANGED, updated);
	    }

	    return removed;
	  };

	  /**
	   * Retrieve a value from the context.
	   *
	   * @param {String} key The kay associated with the value to retrieve.
	   * @returns {*} The value associated with the specified key.
	   */
	  this.get = function(key) {
	    ensureInitialized();
	    return (remoteContext[key] || localContext[key]);
	  };

	  /**
	   * Checks if the specified key is currently defined in the context.
	   *
	   * @param key The key to check.
	   * @returns {boolean} True if the key has an associated value in the context.
	   */
	  this.contains = function(key) {
	    ensureInitialized();
	    return key in remoteContext || key in localContext;
	  };
	}

	const invoker = function(args, fn) {
	  fn.call(this, args);
	};

	class MiniPromise {
	  constructor(executor) {
	    this._responseArgs = null;
	    this._errored = false;
	    this._thens = [];
	    this._catches = [];
	    this._finallys = [];

	    const response = function(errored, handlers) {
	      if (this._responseArgs) {
	        throw Error('Response already sent');
	      }
	      const args = Array.prototype.slice.call(arguments);
	      // Drop the errored and handlers arguments from the binding
	      args.shift();
	      args.shift();
	      this._errored = errored;
	      this._responseArgs = arguments;
	      this._catches.forEach(invoker.bind(this, arguments));
	      this._finallys.forEach(invoker.bind(this, arguments));
	    };

	    const reject = response.bind(this, true, this._catches);
	    const resolve = response.bind(this, false, this._thens);

	    try {
	      executor(resolve, reject);
	    } catch (err) {
	      reject(err);
	    }
	  }

	  then(handler) {
	    if (this._responseArgs && !this._errored) {
	      invoker.call(this, this._responseArgs, handler);
	      return;
	    }

	    this._thens.push(handler);
	  }

	  catch(handler) {
	    if (this._responseArgs && this._errored) {
	      invoker.call(this, this._responseArgs, handler);
	      return;
	    }

	    this._catches.push(handler);
	  }

	  finally(handler) {
	    if (this._responseArgs) {
	      invoker.call(this, this._responseArgs, handler);
	      return;
	    }

	    this._finallys.push(handler);
	  }
	}

	MiniPromise.createPromise = function (executor) {
	  return new (typeof Promise !== 'undefined' ? Promise : MiniPromise)(executor);
	};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var base64Arraybuffer = createCommonjsModule(function (module, exports) {
	/*
	 * base64-arraybuffer
	 * https://github.com/niklasvh/base64-arraybuffer
	 *
	 * Copyright (c) 2012 Niklas von Hertzen
	 * Licensed under the MIT license.
	 */
	(function(){

	  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	  // Use a lookup table to find the index.
	  var lookup = new Uint8Array(256);
	  for (var i = 0; i < chars.length; i++) {
	    lookup[chars.charCodeAt(i)] = i;
	  }

	  exports.encode = function(arraybuffer) {
	    var bytes = new Uint8Array(arraybuffer),
	    i, len = bytes.length, base64 = "";

	    for (i = 0; i < len; i+=3) {
	      base64 += chars[bytes[i] >> 2];
	      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
	      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
	      base64 += chars[bytes[i + 2] & 63];
	    }

	    if ((len % 3) === 2) {
	      base64 = base64.substring(0, base64.length - 1) + "=";
	    } else if (len % 3 === 1) {
	      base64 = base64.substring(0, base64.length - 2) + "==";
	    }

	    return base64;
	  };

	  exports.decode =  function(base64) {
	    var bufferLength = base64.length * 0.75,
	    len = base64.length, i, p = 0,
	    encoded1, encoded2, encoded3, encoded4;

	    if (base64[base64.length - 1] === "=") {
	      bufferLength--;
	      if (base64[base64.length - 2] === "=") {
	        bufferLength--;
	      }
	    }

	    var arraybuffer = new ArrayBuffer(bufferLength),
	    bytes = new Uint8Array(arraybuffer);

	    for (i = 0; i < len; i+=4) {
	      encoded1 = lookup[base64.charCodeAt(i)];
	      encoded2 = lookup[base64.charCodeAt(i+1)];
	      encoded3 = lookup[base64.charCodeAt(i+2)];
	      encoded4 = lookup[base64.charCodeAt(i+3)];

	      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
	      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
	      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
	    }

	    return arraybuffer;
	  };
	})();
	});
	var base64Arraybuffer_1 = base64Arraybuffer.encode;
	var base64Arraybuffer_2 = base64Arraybuffer.decode;

	var base64 = {
	  encode: function(bytes) {
	    return typeof btoa !== 'undefined' ? btoa(bytes) : Buffer.from(bytes).toString('base64');
	  },
	  decode: function(string) {
	    return typeof atob !== 'undefined' ? atob(string) : Buffer.from(string, 'base64').toString();
	  },
	  encodeFromArrayBuffer: base64Arraybuffer.encode,
	  decodeToArrayBuffer: base64Arraybuffer.decode
	};

	const AND = 'and';
	const OR = 'or';

	const FILTER_OPERATORS = {
	  contains: function(a, b) { return a.indexOf(b) >= 0; },
	  equal: function(a, b) { return a === b; },
	  exists: function(a) { return a !== null; }, // Check that the key exists in the dictionary object
	  not_contains: function(a, b) { return !(a.indexOf(b) >= 0); },
	  not_equal: function(a, b) { return a !== b; },
	  not_regex_match: function(value, pattern) { return value && !value.match(pattern); },
	  not_regex64_match: function(value, pattern) { return !regex64Match(value, pattern) },
	  not_starts_with: function(a, b) { return !a.startsWith(b); },
	  kv_contains: function(obj, params) { return (params[0] in obj) && (obj[params[0]].indexOf(params[1]) >= 0) },
	  kv_equal: function(obj, params) { return obj[params[0]] === params[1]; },
	  kv_not_contains: function(obj, params) { return !((params[0] in obj) && (obj[params[0]].indexOf(params[1]) >= 0)); },
	  kv_not_equal: function(obj, params) { return obj[params[0]] !== params[1]; },
	  regex_match: function(value, pattern) { return value && value.match(pattern); },
	  regex64_match: regex64Match,
	  starts_with: function(a, b){ return a.startsWith(b); }
	};

	function regexFromString (string) {
	  if (!string.startsWith('/')) {
	    return new RegExp(string);
	  }

	  const split = string.lastIndexOf('/');
	  return new RegExp(string.substring(1, split), string.substring(split + 1));
	}

	function regex64Match(value, b64pattern) {
	  try {
	    const string = base64.decode(b64pattern);
	    return value && value.match(regexFromString(string)) !== null;
	  } catch (e) {
	    return false;
	  }
	}

	function valueFromKey(context, key) {
	  if (context === undefined) {
	    return undefined;
	  }

	  const nextToken = key.indexOf('.');
	  if (nextToken === 0) {
	    throw new Error('Invalid variant key: ' + key);
	  }

	  if (nextToken === -1) {
	    return key in context ? context[key] : undefined;
	  }

	  return valueFromKey(context[key.substring(0, nextToken)], key.substring(nextToken + 1));
	}

	function evaluateFilter(user, rule) {
	  const value = valueFromKey(user, rule.field);

	  if (rule.operator.startsWith('kv_') && !value) {
	    return false;
	  }

	  // Evaluates a single filter rule against a user.
	  return !!FILTER_OPERATORS[rule.operator](value, rule.value);
	}


	function evaluateRule(user, query, rule, passedRules, failedRules) {
	  let result;
	  if ('combinator' in rule) {
	    // No need to add groups to pass/failed rule sets here. Their children results will be merged up
	    // via recursion.
	    // eslint-disable-next-line no-use-before-define
	    return evaluatePredicate(user, rule, passedRules, failedRules);
	  } else {
	    result = evaluateFilter(user, rule);
	  }

	  // Any other rule is also a terminating branch in our recursion tree, so we add rule id to pass/fail rule set
	  (result ? passedRules : failedRules).add({
	    id: query.id,
	    index: rule.index,
	    field: rule.field
	  });

	  return result;
	}


	function evaluatePredicate(user, query, passedRules, failedRules) {
	  const { rules } = query;

	  if (!rules) {
	    return true;
	  }

	  for (let i = 0; i < rules.length; i++) {
	    const passed = evaluateRule(user, query, rules[i], passedRules, failedRules);
	    if (passed && query.combinator === OR) {
	      return true;
	    }

	    if (!passed && query.combinator === AND) {
	      return false;
	    }
	  }

	  // If we've reached this point on an 'or' all rules failed.
	  return query.combinator === AND;
	}


	/**
	Evaluates a query against a user object and saves passing/failing rule ids to provided sets.

	  @param context A context object containing describing the context the predicate should be evaluated against.
	  @param predicate Nested predicate object that rules structured into groups as a deeply nested tree.
	               note: There is no set limit to the depth of this tree, hence we must work with it
	               using recursion.
	*/
	function evaluate(context, predicate) {
	  const result = {
	    passed: new Set(),
	    failed: new Set()
	  };

	  result.rejected = !evaluatePredicate(context, predicate, result.passed, result.failed);

	  return result;
	}

	const URL_PATTERN = /^([a-z]+):\/\/([^/]+)(.*)/i;

	function cryptography() {
	  return typeof crypto !== 'undefined' ? crypto : msCrypto;
	}

	/**
	 * Convert a String to an ArrayBuffer
	 *
	 * ie11 Supported
	 *
	 * @param str The String to convert to an ArrayBuffer
	 * @returns {ArrayBuffer} The resulting array buffer encoded as utf-8
	 */
	function str2ab(str) {
	  if (typeof TextEncoder !== 'undefined') {
	    return (new TextEncoder()).encode(str).buffer;
	  }

	  const buf = new ArrayBuffer(str.length);
	  const bufView = new Uint8Array(buf);
	  for (let i = 0, strLen = str.length; i < strLen; i++) {
	    bufView[i] = str.charCodeAt(i);
	  }
	  return buf;
	}

	/**
	 * Converts an msCrypto operation to a promise if needed.
	 *
	 * @param op The op (or Promise) to convert if needed.
	 * @returns {{PromiseLike} A promise
	 */
	function cryptoOperationToPromise(op) {
	  if (op.then) {
	    return op;
	  }

	  return MiniPromise.createPromise(function(resolve, reject) {
	    op.oncomplete = function(evt) {
	      resolve(evt.target.result);
	    };

	    function rejectHandler(evt) {
	      reject(evt.toString());
	    }
	    op.onerror = rejectHandler;
	    op.onabort = rejectHandler;
	  });
	}

	/**
	 * Sign a String with HMAC-SHA384
	 *
	 * @param {String} key The HMAC key to use for signing
	 * @param {String} payload The String to sign
	 * @returns {PromiseLike<ArrayBuffer>} The cryptographic signature
	 */
	function sign(key, payload) {
	  const keyFormat = 'raw';
	  const algorithm = { name: 'HMAC', hash: 'SHA-384' };
	  const keyUsages = ['sign'];
	  const crypto = cryptography();

	  return MiniPromise.createPromise(function(resolve, reject) {
	    cryptoOperationToPromise(crypto.subtle.importKey(keyFormat, str2ab(key), algorithm, true, keyUsages))
	      .then(function (cryptoKey) {
	        cryptoOperationToPromise(crypto.subtle.sign(algorithm, cryptoKey, payload))
	          .then(function(bytes) {
	            resolve(base64.encodeFromArrayBuffer(bytes));
	          })
	          .catch(reject);
	      })
	      .catch(reject);
	  });
	}

	function createSignatureHeader(signatureKeyId, signature) {
	  return 'keyId="' + signatureKeyId + '",algorithm="hmac-sha384",signature="' + signature + '"';
	}

	function xhrRequest(options) {
	  return MiniPromise.createPromise(function(resolve, reject) {
	    const xhr = new XMLHttpRequest();
	    xhr.addEventListener('load', function () {
	      if (this.status >= 400) {
	        reject(this.statusText || ('Evolv: Request failed ' + this.status));
	        return;
	      }

	      if (this.status === 200) {
	        resolve(JSON.parse(this.responseText));
	      } else if (this.status === 202) {
	        resolve();
	      } else {
	        console.error('Evolv: Invalid status ' + this.status + ' for response ' + this.responseText);
	        reject(msg);
	      }
	    });
	    xhr.addEventListener('error', reject);
	    xhr.open(options.method, options.url, options.sync);
	    xhr.setRequestHeader('Accept', 'application/json');
	    if (options.signature) {
	      xhr.setRequestHeader('Signature', createSignatureHeader(options.keyId, options.signature));
	    }
	    xhr.send(options.payload);
	  });
	}

	function nodeRequest(options) {
	  return MiniPromise.createPromise(function(resolve, reject) {
	    const parts = URL_PATTERN.exec(options.url);
	    if (!parts) {
	      throw new Error('Evolv: Invalid endpoint URL');
	    }

	    const schema = parts[1];
	    (schema === 'http' ? import('http') : import('https')).then(function (http) {
	      const hostname = parts[2];
	      const path = parts[3];
	      const headers = {
	        'Content-Type': 'application/json;charset=UTF-8',
	        'Accept': 'application/json',
	        'Content-Length': Buffer.byteLength(options.payload)
	      };

	      if (options.signature) {
	        headers['Signature'] = createSignatureHeader(options.keyId, options.signature);
	      }
	      const req = http.request({
	        hostname: hostname,
	        path: path,
	        method: options.method,
	        headers: headers
	      }, function (res) {
	        res.on('data', resolve);
	      });
	      req.on('error', reject);
	      req.write(options.payload);
	      req.end();
	    });
	  });
	}

	function retrieve(options) {
	  return MiniPromise.createPromise(function(resolve, reject) {
	    let payload;
	    if (!options.data) {
	      payload = '';
	    } else if (typeof options.data === 'object') {
	      payload = JSON.stringify(options.data);
	    } else {
	      payload = options.data;
	    }
	    options = assign({ payload:  payload }, options);

	    let rx;
	    if (typeof XMLHttpRequest !== 'undefined') {
	      rx = xhrRequest;
	    } else {
	      rx = nodeRequest;
	    }

	    if (!options.key) {
	      rx(options)
	        .then(resolve)
	        .catch(reject);
	      return;
	    }

	    sign(options.key, str2ab(options.payload))
	      .then(function (signature) {
	        rx(assign({signature:signature}, options))
	          .then(resolve)
	          .catch(reject);
	      })
	      .catch(reject);
	  });
	}

	const CONFIG_SOURCE = 'config';
	const GENOME_SOURCE = 'genome';

	const GENOME_REQUEST_SENT = 'genome.request.sent';
	const CONFIG_REQUEST_SENT = 'config.request.sent';
	const GENOME_REQUEST_RECEIVED = 'genome.request.received';
	const CONFIG_REQUEST_RECEIVED = 'config.request.received';
	const REQUEST_FAILED = 'request.failed';
	const GENOME_UPDATED = 'genome.updated';
	const CONFIG_UPDATED = 'config.updated';
	const EFFECTIVE_GENOME_UPDATED = 'effective.genome.updated';
	const STORE_DESTROYED = 'store.destroyed';

	function moveKeys(keys, from, to) {
	  keys.forEach(function(key) {
	    from.delete(key);
	    to.add(key);
	  });
	}

	function wrapListener(listener) {
	  return function() {
	    try {
	      listener.apply(undefined, arguments);
	    } catch (ex) {
	      console.log(ex);
	    }
	  };
	}

	function getValue(key, genome) {
	  return getValueForKey(key, genome);
	}

	function getConfigValue(key, genome, config) {
	  return getValueForKey(key, config);
	}

	function getValueActive(activeKeys, key) {
	  return activeKeys.has(key);
	}

	function getActiveKeys(activeKeys, prefix) {
	  const result = [];
	  activeKeys.forEach(function(key) {
	    if (!prefix || key.startsWith(prefix)) {
	      result.push(key);
	    }
	  });

	  return result;
	}

	// Exposed for testing
	function evaluatePredicates(version, context, config) {
	  if (!config._experiments || !config._experiments.length) {
	    return {};
	  }

	  function evaluateBranch(context, config, prefix, disabled, entry) {
	    if (config._predicate) {
	      const result = evaluate(context, config._predicate);
	      if (result.rejected) {
	        disabled.push(prefix);
	        return;
	      }
	    }

	    if (config._is_entry_point) {
	      entry.push(prefix);
	    }

	    Object.keys(config).forEach(function (key) {
	      if (key.startsWith('_')) {
	        return;
	      }

	      evaluateBranch(context, config[key], prefix ? prefix + '.' + key : key, disabled, entry);
	    });
	  }

	  const evaluableContext = context.resolve();

	  const result = {};
	  config._experiments.forEach(function(exp) {
	    const evaluableConfig = assign({}, exp);
	    delete evaluableConfig.id;
	    const results = {
	      disabled: [],
	      entry: []
	    };

	    evaluateBranch(evaluableContext, evaluableConfig, '', results.disabled, results.entry);
	    result[exp.id] = results;
	  });

	  return result;
	}

	function EvolvStore(options) {
	  const prefix = options.endpoint + '/' + options.env;
	  const keyId = options.auth && options.auth.id;
	  const key = options.auth && options.auth.secret;
	  const version = options.version || 1;

	  let context;
	  let initialized = false;
	  let waitingToPull = false;
	  let waitingToPullImmediate = true;
	  let genomes = {};
	  let effectiveGenome = {};
	  let allocations = null;
	  let config = null;
	  let genomeFailed = false;
	  let configFailed = false;
	  const genomeKeyStates = {
	    needed: new Set(),
	    requested: new Set(),
	    loaded: new Set()
	  };

	  const configKeyStates = {
	    entry: new Set(),
	    active: new Set(),
	    needed: new Set(),
	    requested: new Set(),
	    loaded: new Set()
	  };

	  let outstandingValuePromises = [];
	  let outstandingConfigPromises = [];
	  let subscriptions = new Set();

	  this.destroy = function() {
	    genomes = undefined;
	    effectiveGenome = undefined;
	    allocations = undefined;
	    config = undefined;

	    delete genomeKeyStates.needed;
	    delete genomeKeyStates.requested;
	    delete genomeKeyStates.loaded;

	    delete configKeyStates.entry;
	    delete configKeyStates.active;
	    delete configKeyStates.needed;
	    delete configKeyStates.requested;
	    delete configKeyStates.loaded;
	    outstandingValuePromises.forEach(function(p) {
	      p.reject();
	    });
	    outstandingValuePromises = undefined;
	    outstandingConfigPromises.forEach(function(p) {
	      p.reject();
	    });
	    outstandingConfigPromises = undefined;
	    subscriptions = undefined;
	    emit(context, STORE_DESTROYED, this);
	    context = undefined;
	  };

	  function reevaluateContext() {
	    if (!config) {
	      return;
	    }

	    const results = evaluatePredicates(version, context, config);
	    configKeyStates.active.clear();
	    configKeyStates.entry.clear();
	    effectiveGenome = {};
	    Object.keys(results).forEach(function(eid) {
	      const result = results[eid];
	      genomeKeyStates.loaded.forEach(function(key) {
	        const active = !result.disabled.some(function(disabledKey) {
	          return key.startsWith(disabledKey);
	        });

	        if (active) {
	          configKeyStates.active.add(key);
	          const entry = result.entry.some(function(entryKey) {
	            return key.startsWith(entryKey);
	          });

	          if (entry) {
	            configKeyStates.entry.add(key);
	          }
	        }
	      });

	      if (eid in genomes) {
	        effectiveGenome = deepMerge(effectiveGenome, filter(genomes[eid], configKeyStates.active));
	      }
	    });

	    emit(context, EFFECTIVE_GENOME_UPDATED, effectiveGenome);
	    subscriptions.forEach(function(listener) {
	      try {
	        listener(effectiveGenome, config);
	      } catch (ex) {
	        console.error(ex);
	      }
	    });
	  }

	  function updateGenome(value) {
	    const allocs = [];
	    const exclusions = [];
	    allocations = value;
	    genomeFailed = false;
	    value.forEach(function(alloc) {
	      const clean = assign({}, alloc);
	      delete clean.genome;
	      delete clean.audience_query;

	      allocs.push(clean);
	      if (clean.excluded) {
	        exclusions.push(clean.eid);
	        return;
	      }

	      genomes[clean.eid] = alloc.genome;
	      flattenKeys(alloc.genome, function(key) {
	        return !key.startsWith('_');
	      }).forEach(genomeKeyStates.loaded.add.bind(genomeKeyStates.loaded));
	    });
	    context.set('experiments.allocations', allocs);
	    context.set('experiments.exclusions', exclusions);
	  }

	  function updateConfig(value) {
	    config = value;
	    configFailed = false;
	    value._experiments.forEach(function(exp) {
	      const clean = assign({}, exp);
	      delete clean.id;
	      flattenKeys(clean, function(key) {
	        return !key.startsWith('_');
	      }).forEach(configKeyStates.loaded.add.bind(configKeyStates.loaded));
	    });
	  }


	  function update(configRequest, requestedKeys, value) {
	    let keyStates = configRequest ? configKeyStates : genomeKeyStates;

	    requestedKeys.forEach(keyStates.requested.delete.bind(keyStates.requested));
	    if (configRequest) {
	      emit(context, CONFIG_REQUEST_RECEIVED, requestedKeys);
	      updateConfig(value);
	    } else {
	      emit(context, GENOME_REQUEST_RECEIVED, requestedKeys);
	      updateGenome(value);
	    }

	    reevaluateContext();

	    let removeConfig = [];
	    let removeValue = [];
	    outstandingValuePromises.concat(outstandingConfigPromises).forEach(function(promise) {
	      if (promise.source === GENOME_SOURCE && (!promise.key || !genomeKeyStates.loaded.has(promise.key))) {
	        return;
	      }

	      let configLoaded = true;
	      if (promise.key) {
	        configLoaded = false;
	        configKeyStates.loaded.forEach(function(prefix) {
	          if (promise.key.startsWith(prefix)) {
	            configLoaded = true;
	          }
	        });
	      }

	      if (!configLoaded && !(configRequest && (version === 1 || requestedKeys.indexOf(promise.key) >= 0))) {
	        return;
	      }

	      promise.resolve(promise.transform(promise.key, effectiveGenome, config));
	      (promise.source === CONFIG_SOURCE ? removeConfig : removeValue).push(promise);
	    });

	    outstandingValuePromises = outstandingValuePromises.filter(function(promise) {
	      return removeValue.indexOf(promise) < 0;
	    });

	    outstandingConfigPromises = outstandingConfigPromises.filter(function(promise) {
	      return removeConfig.indexOf(promise) < 0;
	    });

	    emit(context,configRequest ? CONFIG_UPDATED : GENOME_UPDATED, value);
	  }

	  function failed(configRequest, requestedKeys, err) {
	    console.log(err);
	    let keyStates;
	    emit(context, REQUEST_FAILED, configRequest ? CONFIG_SOURCE : GENOME_SOURCE, requestedKeys, err);
	    if (configRequest) {
	      keyStates = configKeyStates;
	    } else {
	      keyStates = genomeKeyStates;
	    }
	    moveKeys(requestedKeys, keyStates.requested, keyStates.needed);

	    let outstandingPromises;
	    if (configRequest) {
	      outstandingPromises = outstandingConfigPromises;
	      configFailed = true;
	    } else {
	      outstandingPromises = outstandingValuePromises;
	      genomeFailed = true;
	    }

	    let removeConfig = [];
	    let removeValue = [];
	    outstandingValuePromises.concat(outstandingConfigPromises).forEach(function(promise) {
	      if (version === 1 || requestedKeys.indexOf(promise.key) >= 0) {
	        (promise.source === CONFIG_SOURCE ? removeConfig : removeValue).push(promise);
	        try {
	          promise.reject(err);
	        } catch (ex) {
	          console.error(ex);
	        }
	      }
	    });

	    outstandingValuePromises = outstandingValuePromises.filter(function(promise) {
	      return removeValue.indexOf(promise) >= 0;
	    });

	    outstandingConfigPromises = outstandingConfigPromises.filter(function(promise) {
	      return removeConfig.indexOf(promise) >= 0;
	    });

	    if (configRequest) {
	      outstandingConfigPromises = outstandingPromises;
	    } else {
	      outstandingValuePromises = outstandingPromises;
	    }
	  }

	  function pull(immediate) {
	    if (!initialized) {
	      waitingToPullImmediate = waitingToPullImmediate || immediate;
	      return;
	    }

	    if (!immediate && !waitingToPullImmediate) {
	      if (!waitingToPull) {
	        waitingToPull = true;
	        setTimeout(pull.bind(undefined, true));
	      }

	      return;
	    }

	    waitingToPullImmediate = false;

	    if (configKeyStates.needed.size || version === 1) {
	      const requestedKeys = [];
	      configKeyStates.needed.forEach(requestedKeys.push.bind(requestedKeys));
	      configKeyStates.needed.clear();
	      retrieve({
	        method: 'get',
	        url: prefix + '/configuration.json',
	        keyId: keyId,
	        key: key
	      })
	        .then(update.bind(this, true, requestedKeys))
	        .catch(failed.bind(this, true, requestedKeys));
	      moveKeys(requestedKeys, configKeyStates.needed, configKeyStates.requested);
	      emit(context, CONFIG_REQUEST_SENT, requestedKeys);
	    }

	    if (genomeKeyStates.needed.size || version === 1) {
	      const requestedKeys = [];
	      genomeKeyStates.needed.forEach(requestedKeys.push.bind(requestedKeys));
	      genomeKeyStates.needed.clear();
	      retrieve({
	        method: 'post',
	        url: prefix + '/allocations',
	        keyId: keyId,
	        key: key,
	        data: {uid: context.uid, sid: context.uid}
	      })
	        .then(update.bind(this, false, requestedKeys))
	        .catch(failed.bind(this, false, requestedKeys));
	      moveKeys(requestedKeys, genomeKeyStates.needed, genomeKeyStates.requested);
	      emit(context, GENOME_REQUEST_SENT, requestedKeys);
	    }

	    waitingToPull = false;
	  }

	  function createRequestSubscribablePromise(source, transform, key) {
	    let resolve = null;
	    let reject = null;
	    const promise = MiniPromise.createPromise(function(res, rej) {
	      resolve = wrapListener(res);
	      reject = wrapListener(rej);
	    });

	    promise.listen = function(listener) {
	      subscriptions.add(function(effectiveGenome, config) {
	        listener(transform(key, effectiveGenome, config));
	      });
	    };

	    let keyStates;
	    let failed;
	    let outstandingPromises;
	    let loaded = false;
	    if (source === GENOME_SOURCE) {
	      keyStates = genomeKeyStates;
	      failed = genomeFailed;
	      outstandingPromises = outstandingValuePromises;
	      loaded = keyStates.loaded.has(key);
	    } else {
	      keyStates = configKeyStates;
	      failed = configFailed;
	      outstandingPromises = outstandingConfigPromises;
	      keyStates.loaded.forEach(function(prefix) {
	        if (!key || key.startsWith(prefix)) {
	          loaded = true;
	        }
	      });
	    }

	    if (loaded) {
	      resolve(transform(key, effectiveGenome, config));
	      return promise;
	    }

	    if (keyStates.loaded.has(key)) {
	      resolve(transform(key, effectiveGenome, config));
	      return promise;
	    }

	    if (failed) {
	      reject('The values could not be retrieved');
	      return promise;
	    }

	    const outstanding = {
	      key: key,
	      resolve: resolve,
	      reject: reject,
	      transform: transform,
	      source: source
	    };
	    outstandingPromises.push(outstanding);

	    if (version !== 1 && !keyStates.needed.has(key) && !keyStates.requested.has(key)) {
	      keyStates.needed.add(key);

	      if (source === GENOME_SOURCE) {
	        configKeyStates.needed.add(key);
	      }

	      pull();
	    }

	    return promise;
	  }

	  if (version === 1) {
	    pull(true);
	  } else if (options.version !== 2) {
	    throw new Error('Unsupported API version');
	  }

	  Object.defineProperty(this, 'state', {
	    get: function() {
	      return {
	        allocations: deepClone(allocations),
	        config: deepClone(config)
	      };
	    }
	  });

	  this.fetch = pull.bind(this, true);

	  this.preload = function(prefixes, configOnly, immediate) {
	    prefixes.forEach(configKeyStates.needed.add.bind(configKeyStates.needed));

	    if (!configOnly) {
	      prefixes.forEach(genomeKeyStates.needed.add.bind(genomeKeyStates.needed));
	    }
	    pull(immediate);
	  };

	  this.initialize = function(_context) {
	    if (initialized) {
	      throw new Error('Evolv: The store has already been initialized.');
	    }
	    context = _context;
	    initialized = true;
	    pull();
	    waitFor(context, CONTEXT_CHANGED, reevaluateContext);
	  };

	  this.subscribe = subscriptions.add.bind(subscriptions);
	  this.unsubscribe = subscriptions.delete.bind(subscriptions);

	  this.get = createRequestSubscribablePromise.bind(this, GENOME_SOURCE, getValue.bind(this));
	  this.getConfig = createRequestSubscribablePromise.bind(this, CONFIG_SOURCE, getConfigValue.bind(this));
	  this.isActive = createRequestSubscribablePromise.bind(
	    this, CONFIG_SOURCE, getValueActive.bind(this, configKeyStates.active));
	  this.getActiveKeys = createRequestSubscribablePromise.bind(
	    this, CONFIG_SOURCE, getActiveKeys.bind(this, configKeyStates.active));
	}

	const DELAY = 1;

	function fallbackBeacon(url, data, sync) {
	  retrieve({
	    method: 'post',
	    url: url,
	    data: data,
	    sync: sync
	  })
	    .catch(function(err) {
	      console.log(err);
	    });
	  return true;
	}

	function Emitter(endpoint) {
	  let messages = [];
	  let timer;

	  function send(url, data, sync) {
	    if (typeof window !== 'undefined' && window.navigator.sendBeacon) {
	      return window.navigator.sendBeacon(url, data);
	    } else {
	      return fallbackBeacon(url, data, sync);
	    }
	  }

	  function transmit() {
	    let sync = false;
	    if (typeof this !== 'undefined') {
	      const currentEvent = this.event && this.event.type;
	      sync = currentEvent === 'unload' || currentEvent === 'beforeunload';
	    }

	    if (!messages.length) {
	      return;
	    }

	    const batch = messages;
	    messages = [];
	    if (timer) {
	      clearTimeout(timer);
	    }
	    timer = undefined;

	    batch.forEach(function(message) {
	      const endpointMatch = endpoint.match(new RegExp('\\/(v\\d+)\\/\\w+\\/([a-z]+)$'));
	      if (endpointMatch[2] === 'analytics' && endpointMatch[1] === 'v1') {
	        return;
	      }

	      let editedMessage = message;
	      if (endpointMatch[1] === 'v1') {
	        // change needed to support v1 of the participants api
	        editedMessage = message[1] || {};
	        editedMessage.type = message[0];
	      }

	      if (!send(endpoint, JSON.stringify(editedMessage), sync)) {
	        messages.push(message);
	        console.error('Evolv: Unable to send beacon');
	      }
	    });

	    if (messages.length) {
	      timer = setTimeout(transmit, DELAY);
	    }
	  }

	  if (typeof window !== 'undefined') {
	    window.addEventListener('unload', transmit);
	    window.addEventListener('beforeunload', transmit);
	  }

	  this.emit = function(type, data, flush=false) {
	    messages.push([type, data]);
	    if (flush) {
	      transmit();
	      return;
	    }

	    if (!timer) {
	      timer = setTimeout(transmit, DELAY);
	    }
	  };

	  this.flush = transmit;
	}

	/**
	 * @typedef {Promise} SubscribablePromise
	 * @property {function(function):undefined} then Then
	 * @property {function(function):undefined} listen Listen
	 * @property {function(function):undefined} catch Catch
	 * @property {function(function):undefined} finally Finally
	 */

	/**
	 * The EvolvClient provides a low level integration with the Evolv participant APIs.
	 *
	 * The client provides asynchronous access to key states, values, contexts, and configurations.
	 *
	 * @param options {Object} An object of options for the client.
	 * @constructor
	 */
	function EvolvClient(options) {
	  let initialized = false;

	  if (!options.env) {
	    throw new Error('"env" must be specified');
	  }

	  if (typeof options.autoConfirm === 'undefined') {
	    options.autoConfirm = true;
	  }

	  options.endpoint = options.endpoint || 'https://participants.evolv.ai/';
	  options.version = options.version || 1;

	  const context = new EvolvContext(options);
	  const store = new EvolvStore(options);
	  const contextBeacon = new Emitter(options.endpoint + '/' + options.env + '/analytics');
	  const eventBeacon = new Emitter(options.endpoint + '/' + options.env + '/events');

	  /**
	   * The context against which the key predicates will be evaluated.
	   */
	  Object.defineProperty(this, 'context', { get: function() { return context; } });

	  /**
	   * Add listeners to lifecycle events that take place in to client.
	   *
	   * Currently supported events:
	   * * INITIALIZED - Called when the client is fully initialized and ready for use with (topic, options)
	   * * CONTEXT_INITIALIZED = Called when the context is fully initialized and ready for use with (topic, updated_context)
	   * * CONTEXT_CHANGED - Called whenever a change is made to the context values with (topic, updated_context)
	   * * CONTEXT_VALUE_REMOVED - Called when a value is removed from context with (topic, key, updated_context)
	   * * CONTEXT_VALUE_ADDED - Called when a new value is added to the context with (topic, key, value, local, updated_context)
	   * * CONTEXT_VALUE_CHANGED - Called when a value is changed in the context (topic, key, value, before, local, updated_context)
	   * * CONTEXT_DESTROYED - Called when the context is destroyed with (topic, context)
	   * * GENOME_REQUEST_SENT - Called when a request for a genome is sent with (topic, requested_keys)
	   * * CONFIG_REQUEST_SENT - Called when a request for a config is sent with (topic, requested_keys)
	   * * GENOME_REQUEST_RECEIVED - Called when the result of a request for a genome is received (topic, requested_keys)
	   * * CONFIG_REQUEST_RECEIVED - Called when the result of a request for a config is received (topic, requested_keys)
	   * * REQUEST_FAILED - Called when a request fails (topic, source, requested_keys, error)
	   * * GENOME_UPDATED - Called when the stored genome is updated (topic, allocation_response)
	   * * CONFIG_UPDATED - Called when the stored config is updated (topic, config_response)
	   * * EFFECTIVE_GENOME_UPDATED - Called when the effective genome is updated (topic, effectiveGenome)
	   * * STORE_DESTROYED - Called when the store is destroyed (topic, store)
	   * * CONFIRMED - Called when the consumer is confirmed (topic)
	   * * CONTAMINATED - Called when the consumer is contaminated (topic)
	   * * EVENT_EMITTED - Called when an event is emitted through the beacon (topic, type, score)
	   *
	   * @param {String} topic The event topic on which the listener should be invoked.
	   * @param {Function} listener The listener to be invoked for the specified topic.
	   * @method
	   * @see {@link EvolvClient#once} for listeners that should only be invoked once.
	   */
	  this.on = waitFor.bind(undefined, context);

	  /**
	   * Add a listener to a lifecycle event to be invoked once on the next instance of the
	   * event to take place in to client.
	   *
	   * See the "on" function for supported events.
	   *
	   * @param {String} topic The event topic on which the listener should be invoked.
	   * @param {Function} listener The listener to be invoked for the specified topic.
	   * @method
	   * @see {@link EvolvClient#on} for listeners that should be invoked on each event.
	   */
	  this.once = waitOnceFor.bind(undefined, context);

	  /**
	   * Preload all keys under under the specified prefixes.
	   *
	   * @param {Array.<String>} prefixes A list of prefixes to keys to load.
	   * @param {Boolean} configOnly If true, only the config would be loaded. (default: false)
	   * @param {Boolean} immediate Forces the requests to the server. (default: false)
	   * @method
	   */
	  this.preload = store.preload.bind(store);

	  /**
	   * Get the value of a specified key.
	   *
	   * @param {String} key The key of the value to retrieve.
	   * @returns {SubscribablePromise.<*|Error>} A SubscribablePromise that resolves to the value of the specified key.
	   * @method
	   */
	  this.get = store.get.bind(store);

	  /**
	   * Check if a specified key is currently active.
	   *
	   * @param {String} key The key to check.
	   * @returns {SubscribablePromise.<Boolean|Error>} A SubscribablePromise that resolves to true if the specified key is
	   * active.
	   * @method
	   */
	  this.isActive = store.isActive.bind(store);

	  /**
	   * Check all active keys that start with the specified prefix.
	   *
	   * @param {String} prefix The prefix of the keys to check.
	   * @returns {SubscribablePromise.<Array.<String>|Error>} A SubscribablePromise that resolves to an array of keys when
	   * the specified prefix.
	   * @method
	   */
	  this.getActiveKeys = store.getActiveKeys.bind(store);

	  /**
	   * Get the configuration for a specified key.
	   *
	   * @param {String} key The key to retrieve the configuration for.
	   * @returns {SubscribablePromise.<*|Error>} A SubscribablePromise that resolves to the configuration of the
	   * specified key.
	   * @method
	   */
	  this.getConfig = store.getConfig.bind(store);
	  this.emit = function(type, score, flush) {
	    eventBeacon.emit(type, assign({
	      uid: context.uid,
	      sid: context.sid,
	      score: score
	    }, context.remoteContext), flush);
	    emit(context, EvolvClient.EVENT_EMITTED, type, score);
	  };

	  /**
	   * Confirm that the consumer has successfully received and applied values, making them eligible for inclusion in
	   * optimization statistics.
	   */
	  this.confirm = function() {
	    const remoteContext = context.remoteContext;
	    if (
	      !remoteContext.experiments ||
	      !remoteContext.experiments.allocations || !remoteContext.experiments.allocations.length
	    ) {
	      return [];
	    }

	    remoteContext.experiments.allocations.forEach(function(alloc) {
	      eventBeacon.emit('confirmation', assign({
	        uid: alloc.uid,
	        sid: alloc.sid,
	        eid: alloc.eid,
	        cid: alloc.cid
	      }, context.remoteContext));
	    });
	    eventBeacon.flush();
	    emit(context, EvolvClient.CONFIRMED);
	  };

	  /**
	   * Marks a consumer as unsuccessfully retrieving and / or applying requested values, making them ineligible for
	   * inclusion in optimization statistics.
	   */
	  this.contaminate = function() {
	    const remoteContext = context.remoteContext;
	    if (
	      !remoteContext.experiments ||
	      !remoteContext.experiments.allocations || !remoteContext.experiments.allocations.length
	    ) {
	      return [];
	    }

	    remoteContext.experiments.allocations.forEach(function(alloc) {
	      eventBeacon.emit('contamination', assign({
	        uid: alloc.uid,
	        sid: alloc.sid,
	        eid: alloc.eid,
	        cid: alloc.cid
	      }, context.remoteContext));
	    });
	    eventBeacon.flush();
	    emit(context, EvolvClient.CONTAMINATED);
	  };

	  /**
	   * Initializes the client with required context information.
	   *
	   * @param {String} uid A globally unique identifier for the current participant.
	   * @param {String} sid A globally unique session identifier for the current participant.
	   * @param {Object} remoteContext A map of data used for evaluating context predicates and analytics.
	   * @param {Object} localContext A map of data used only for evaluating context predicates.
	   */
	  this.initialize = function (uid, sid, remoteContext, localContext) {
	    if (initialized) {
	      throw Error('Evolv: Client is already initialized');
	    }

	    if (!uid) {
	      throw new Error('Evolv: "uid" must be specified');
	    }

	    if (!sid) {
	      throw new Error('Evolv: "sid" must be specified');
	    }

	    context.initialize(uid, sid, remoteContext, localContext);
	    store.initialize(context);

	    waitFor(context, CONTEXT_INITIALIZED, function(type, ctx) {
	      contextBeacon.emit(type, context.remoteContext);
	    });
	    waitFor(context, CONTEXT_VALUE_ADDED, function(type, key, value, local) {
	      if (local) {
	        return;
	      }

	      contextBeacon.emit(type, { key: key, value: value });
	    });
	    waitFor(context, CONTEXT_VALUE_CHANGED, function(type, key, value, before, local) {
	      if (local) {
	        return;
	      }

	      contextBeacon.emit(type, { key: key, value: value });
	    });
	    waitFor(context, CONTEXT_VALUE_REMOVED, function(type, key, local) {
	      if (local) {
	        return;
	      }

	      contextBeacon.emit(type, { key: key });
	    });

	    if (options.autoConfirm) {
	      waitFor(EFFECTIVE_GENOME_UPDATED, this.confirm.bind(this));
	      waitFor(REQUEST_FAILED, this.contaminate.bind(this));
	    }

	    initialized = true;
	    emit(context, EvolvClient.INITIALIZED, options);
	  };

	  /**
	   * Force all beacons to transmit.
	   */
	  this.flush = function() {
	    eventBeacon.flush();
	    contextBeacon.flush();
	  };

	  /**
	   * Destroy the client and its dependencies.
	   */
	  this.destroy = function () {
	    this.flush();
	    store.destroy();
	    context.destroy();
	    destroyScope(context);
	  };
	}

	EvolvClient.INITIALIZED = 'initialized';
	EvolvClient.CONFIRMED = 'confirmed';
	EvolvClient.CONTAMINATED = 'contaminated';
	EvolvClient.EVENT_EMITTED = 'event.emitted';

	function EvolvAssetManager(options) {

		const client = new EvolvClient(options);
		Object.defineProperty(this, 'client', { get: function () { return client }});

		this.initialize = client.initialize.bind(client);

		const context = {
			web: {
				url: window.location.href
			},
			user_attributes: options.user.attributes
		};

		client.initialize(
			options.user.uid,
			options.user.sid,
			context
		);

		const maxTimeoutAttempts = 3;
		const maxTimeout = 1000;

		let timeoutAttempts = 0;
		let appliedClasses = [];
		let unappliedFunctions = new Set();
		let appliedFunctions = new Set();

		function retrieveEvolvCssAsset() {
			let cssAsset;
		
			const links = document.getElementsByTagName('link');

			for (let i = 0; i < links.length; i++) {
				const link = links[i];
				if (link.rel === 'stylesheet' && link.href && link.href.indexOf('evolv.ai') >= 0 && link.href.indexOf('assets.css') >= 0) {
					cssAsset = link;
					break;
				}
			}

			return cssAsset
		}

		function retrieveEvolvJsAsset() {
			let jsAsset;
		
			const scripts = document.getElementsByTagName('script');
		
			for (let i = 0; i < scripts.length; i++) {
				const script = scripts[i];
				if (script.src && script.src.indexOf('evolv.ai') >= 0 && script.src.indexOf('assets.js') >= 0) {
					jsAsset = script;
					break;
				}
			}
		
			return jsAsset;
		}

		const invokeFunctions = function () {
			const evolv = window._evolv;
			if (typeof evolv === 'undefined' || !evolv.javascript || !evolv.javascript.variants) {
				if (timeoutAttempts < maxTimeoutAttempts) {
					this.timer = setTimeout(this, maxTimeout);
					timeoutAttempts++;
				} else {
					client.contaminate();
				}
				return;
			}

			const promises = [];
			unappliedFunctions.forEach(function (key) {
				if (key in evolv.javascript.variants) {
					promises.push(evolv.javascript.variants[key]());
					appliedFunctions.add(key);
				}
			});

			Promise.all(promises)
				.then(function () {
					client.confirm();
				})
				.catch(function (err) {
					client.contaminate();
				});
		};

		const cssAsset = retrieveEvolvCssAsset();
		const jsAsset = retrieveEvolvJsAsset();

		client.getActiveKeys('web').listen(function (keys) {
			const liveContexts = keys.map(function (key) {
				return 'evolv_'.concat(key.replace(/\./g, '_'));
			});

			if (appliedClasses.length) {
				appliedClasses.forEach(function (c) {
					document.documentElement.classList.remove(c);
				});
			}

			liveContexts.forEach(function (c) {
				document.documentElement.classList.add(c);
			});
			appliedClasses = liveContexts.slice();

			if (jsAsset) {
				liveContexts.forEach(function (key) {
					if (!appliedFunctions.has(key)) {
						unappliedFunctions.add(key);
					}
				});
				invokeFunctions.call(invokeFunctions);
			} else if (cssAsset) {
				client.confirm();
			}
		});
	}

	return EvolvAssetManager;

}());
