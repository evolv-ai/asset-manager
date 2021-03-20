import {getCookie, setCookie} from "./cookies.js";

/**
 * @description Storage manager to ensure no data is persisted if consentis required, and has not been given.
 * The persisted value always takes precedence in retrieval
 *
 * @param useCookies - A String - 'true' for the top level domain, otherwise pass in the subdomain. Leave blank to use
 * local storage
 * @param allowPersistence - true is the most common. This generally false when a user has not accepted cookie tracking
 * @constructor
 */
function EvolvStorageManager(useCookies, allowPersistence) {
  let _allowPersistence = allowPersistence;

  let localConsentStore = {};
  let localSessionConsentStore = {};

  let getConsentStore = function(session) {
    return session ? localSessionConsentStore : localConsentStore;
  };

  this.store = function (key, value, session) {
    if (!_allowPersistence) {
      getConsentStore(session)[key] = {
        value: value,
        session: session
      };
      return;
    }

    if (useCookies && !session) {
      const domain = useCookies === 'true' ? "" : useCookies;
      return setCookie('evolv:' + key, value, 365, domain);
    }
    (session ? window.sessionStorage : window.localStorage).setItem('evolv:' + key, value);
  };

  function retrievePersisted(key, session) {
    if (useCookies && !session) {
      return getCookie('evolv:' + key);
    }
    return (session ? window.sessionStorage : window.localStorage).getItem('evolv:' + key);
  }

  this.retrieve = function (key, session) {
    let persistedValue = retrievePersisted(key, session);

    if (persistedValue !== undefined) return persistedValue;

    if (!_allowPersistence) {
      let consentStore = getConsentStore(session);
      return consentStore[key] && consentStore[key].value;
    }

    return persistedValue;
  };

  this.allowPersistentStorage = function() {
    if (_allowPersistence) return;
    _allowPersistence = true;
    let store = this.store;

    Object.keys(localConsentStore).forEach(function (key) {
      store(key, localConsentStore[key].value, false);
    });

    Object.keys(localSessionConsentStore).forEach(function (key) {
      store(key, localSessionConsentStore[key].value, true);
    });

    localConsentStore = {};
    localSessionConsentStore = {};
  };
}

export default EvolvStorageManager
