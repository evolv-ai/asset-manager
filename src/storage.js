import {getCookie, setCookie} from "./cookies.js";

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

  this.retrieve = function (key, session) {
    if (!_allowPersistence) {
      let consentStore = getConsentStore(session);
      return consentStore[key] && consentStore[key].value;
    }

    if (useCookies && !session) {
      return getCookie('evolv:' + key);
    }
    return (session ? window.sessionStorage : window.localStorage).getItem('evolv:' + key);
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
