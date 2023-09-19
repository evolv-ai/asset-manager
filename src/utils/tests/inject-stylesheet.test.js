import * as assert from 'assert';

import jsdom from '../../tests/mocks/jsdom.js';
import {injectStylesheet, injectStylesheetWithAutoReplace, MAX_RETRIES} from '../inject-stylesheet.js';


describe('injectStylesheet()', () => {
	let cleanup;

	const endpoint = 'https://participants.evolv.ai/';
	const version = 1;
	const env = '66c5421c67';
	const uid = '97039403_1640028197170';

	const triggerCallback = (mockedMutationsList) => {
		Object.entries(callbacks).forEach(([id, callback]) => {
			callback(mockedMutationsList);
		});
	};

	let callbacks = {}

	beforeEach(() => {
		cleanup = jsdom();

		const mutationObserverMock = class MU {
			_id = Math.random();
			callback = null;
			constructor(callback) {
				this.callback = callback;
			}
			observe = () => {
				callbacks[this._id] = this.callback;
			};
			disconnect = () => {
				delete callbacks[this._id];
			};
		};
		window.MutationObserver = mutationObserverMock;
	});

	afterEach(() => {
		cleanup();
		callbacks = {};
	});

	let assetsCSSUrl = 'https://participants.evolv.ai/v1/66c5421c67/97039403_1640028197170/assets.css';
	it('should insert stylesheet into <head>', () => {
		// Preconditions
		assert.strictEqual(document.head.children.length, 0);

		// Act
		injectStylesheet(endpoint, env, version, uid);

		// Assert
		assert.notStrictEqual(document.head.lastChild, null);

		const tag = document.head.lastChild;

		assert.strictEqual(tag.nodeName, 'LINK');
		assert.strictEqual(tag.getAttribute('rel'), 'stylesheet');
		assert.strictEqual(tag.getAttribute('href'), assetsCSSUrl);
	});

	it('should append query string when `cid` argument is passed', () => {
		// Arrange
		const cid = '0a6990bda639:0af418c62e';

		// Preconditions
		assert.strictEqual(document.head.children.length, 0);

		// Act
		injectStylesheet(endpoint, env, version, uid, cid);

		// Assert
		assert.notStrictEqual(document.head.lastChild, null);

		const tag = document.head.lastChild;
		const href = tag.getAttribute('href');
		const url = new URL(href);

		assert.strictEqual(tag.getAttribute('href'), 'https://participants.evolv.ai/v1/66c5421c67/97039403_1640028197170/assets.css?previewcid=0a6990bda639:0af418c62e');
		assert.strictEqual(url.searchParams.has('previewcid'), true);
		assert.strictEqual(url.searchParams.get('previewcid'), '0a6990bda639:0af418c62e');
	});

	it('should reinsert stylesheet into <head> if it is removed by external task', () => {
		// Preconditions
		assert.strictEqual(document.head.children.length, 0);

		// Act
		injectStylesheetWithAutoReplace(endpoint, env, version, uid);

		// Assert
		assert.notStrictEqual(document.head.lastChild, null);

		document.head.lastChild.remove();
		triggerCallback([{
			removedNodes: [{
				nodeName: 'LINK',
				href: assetsCSSUrl
			}]
		}]);

		const tag = document.querySelector(`link[href="${assetsCSSUrl}"]`)

		assert.notStrictEqual(document.head.lastChild, null);
		assert.strictEqual(document.head.lastChild, tag);
		assert.strictEqual(tag.nodeName, 'LINK');
		assert.strictEqual(tag.getAttribute('rel'), 'stylesheet');
		assert.strictEqual(tag.getAttribute('href'), assetsCSSUrl);
	});

	it('should reinsert stylesheet into <head> if it is removed by external task up to the max retries', () => {
		// Preconditions
		assert.strictEqual(document.head.children.length, 0);

		// Act
		injectStylesheetWithAutoReplace(endpoint, env, version, uid);

		// Assert
		assert.notStrictEqual(document.head.lastChild, null);

		for (let i = 0; i <= MAX_RETRIES; i++) {
			document.head.lastChild.remove();
			triggerCallback([{
				removedNodes: [{
					nodeName: 'LINK',
					href: assetsCSSUrl
				}]
			}]);
		}

		assert.strictEqual(document.head.lastChild, null);
	});
});
