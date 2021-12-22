import * as assert from 'assert';

import jsdom from '../../tests/mocks/jsdom.js';
import { injectStylesheet } from '../inject-stylesheet.js';


describe('injectStylesheet()', () => {
	let cleanup;

	const endpoint = 'https://participants.evolv.ai/';
	const version = 1;
	const env = '66c5421c67';
	const uid = '97039403_1640028197170';

	beforeEach(() => {
		cleanup = jsdom();
	});

	afterEach(() => {
		cleanup();
	});

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
		assert.strictEqual(tag.getAttribute('href'), 'https://participants.evolv.ai/v1/66c5421c67/97039403_1640028197170/assets.css');
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
});
