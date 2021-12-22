import * as assert from 'assert';

import jsdom from '../../tests/mocks/jsdom.js';
import { injectScript } from '../inject-script.js';


describe('injectScript()', () => {
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

	it('should insert script into <head>', (done) => {
		// Preconditions
		assert.strictEqual(document.head.children.length, 0);

		// Act
		injectScript(endpoint, env, version, uid);

		// Assert
		assert.notStrictEqual(document.head.lastChild, null);

		const tag = document.head.lastChild;

		assert.strictEqual(tag.nodeName, 'SCRIPT');
		assert.strictEqual(tag.getAttribute('src'), 'https://participants.evolv.ai/v1/66c5421c67/97039403_1640028197170/assets.js');

		done();
	});

	it('should append query string when `cid` argument is passed', (done) => {
		// Arrange
		const cid = '0a6990bda639:0af418c62e';

		// Preconditions
		assert.strictEqual(document.head.children.length, 0);

		// Act
		injectScript(endpoint, env, version, uid, cid);

		// Assert
		assert.notStrictEqual(document.head.lastChild, null);

		const tag = document.head.lastChild;
		const src = tag.getAttribute('src');
		const url = new URL(src);

		assert.strictEqual(tag.getAttribute('src'), 'https://participants.evolv.ai/v1/66c5421c67/97039403_1640028197170/assets.js?previewcid=0a6990bda639:0af418c62e');
		assert.strictEqual(url.searchParams.has('previewcid'), true);
		assert.strictEqual(url.searchParams.get('previewcid'), '0a6990bda639:0af418c62e');

		done();
	});
});
