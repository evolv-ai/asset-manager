import { MiniPromise } from '@evolv/javascript-sdk';

export function scheduleOnLoad(fn, contextKey) {
  return MiniPromise.createPromise(function (resolve, reject) {
    if (['complete', 'loaded'].indexOf(document.readyState) !== -1) {
      try {
        fn({key: contextKey}, resolve, reject);
      } catch (err) {
        reject(err);
      }
    } else {
      window.addEventListener('load', function () {
        try {
          fn({key: contextKey}, resolve, reject);
        } catch (err) {
          reject(err);
        }
      });
    }
  });
}

export function scheduleOnDOMContentLoaded(fn, contextKey) {
  return MiniPromise.createPromise(function (resolve, reject) {
    if (['interactive', 'complete', 'loaded'].indexOf(document.readyState) !== -1) {
      try {
        fn({key: contextKey}, resolve, reject);
      } catch (err) {
        reject(err);
      }
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        try {
          fn({key: contextKey}, resolve, reject);
        } catch (err) {
          reject(err);
        }
      });
    }
  });
}
