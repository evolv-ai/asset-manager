import * as assert from 'assert';
import { WindowMock, DocumentMock } from './mocks/document.mock.js';
import EvolvMock from './mocks/evolv.mock.js';
import sinon from 'sinon';

let attributeEnvironmentId = 'testing';
let webloader;
describe('the web loader', () => {
	afterEach(() => {
		delete global.window;
		delete global.document;
	});

	function setupGlobal(doNotTrack, useCookiesDomain, datasetMock = {}) {
		const dataset = {
			evolvEnvironment: attributeEnvironmentId,
			evolvUseCookies: useCookiesDomain,
			...datasetMock
		};

		const document = new DocumentMock({
			cookie: '',
			currentScript: {
				dataset,
				src: ''
			}
		});
		const window = new WindowMock({ document });
		const navigator = { doNotTrack: doNotTrack };
		global.window = window;
		global.document = document;
		global.window.location = {
			href: 'https://test-site.com',
			hash: '',
			search: ''
		};
		global.navigator = navigator;

		global.evolv = {
			client: new EvolvMock()
		};
	}

	it('should initialize properly', async () => {
		setupGlobal(null);

		webloader = await import('../webloader-lite.js');
		const scripts = document.getElementsByTagName('script');
		const links = document.getElementsByTagName('link');
		assert.equal(scripts.length, 1, 'The script should have been added');
		assert.equal(links.length, 1, 'The stylesheet should have been added');
		assert.ok(window.localStorage.values['evolv:uid'], 'The user id should have been generated and stored');
		assert.ok(window.evolv.context, 'The evolv context should have been exposed');
		assert.ok(window.evolv.client, 'The evolv client should have been exposed');
		assert.ok(window.evolv.assetManager, 'The evolv assetManager should have been exposed');
		assert.equal(
			window.evolv.context.uid, window.localStorage.values['evolv:uid'],
			'The evolv context should have been initialized with the same uid as stored');
	});

	it('should only initialize one webloader', async () => {
		setupGlobal(null);

		webloader = await import('../webloader-lite.js')
		var webloader2 = await import('../webloader-lite.js?cachebust=true');

		const scripts = document.getElementsByTagName('script');
		const links = document.getElementsByTagName('link');
		assert.equal(scripts.length, 1, 'One script should have been added');
		assert.equal(links.length, 1, 'One stylesheet should have been added');
		assert.ok(window.localStorage.values['evolv:uid'], 'The user id should have been generated and stored');
		assert.ok(window.evolv.context, 'The evolv context should have been exposed');
		assert.ok(window.evolv.client, 'The evolv client should have been exposed');
		assert.ok(window.evolv.assetManager, 'The evolv assetManager should have been exposed');
		assert.equal(
			window.evolv.context.uid, window.localStorage.values['evolv:uid'],
			'The evolv context should have been initialized with the same uid as stored');
	});

	it('should initialize with cookies configured and domain defined', async () => {
		setupGlobal(null, "*.example.com");

		webloader = await import(`../webloader-lite.js?foo=${Math.random()}`);

		assert.equal(window.localStorage.values['evolv:uid'], undefined, 'The user id should not be in local storage');
		assert.match(document.cookie, /(evolv:uid=)([0-9]+_[0-9]+)(; max-age=)(.+)(; path=\/; domain=\*\.example\.com)/, 'The user id should have been generated and stored in cookies');

		assert.equal(
			window.evolv.context.uid, /(evolv:uid=)([0-9]+_[0-9]+)/.exec(document.cookie)[2],
			'The evolv context should have been initialized with the same uid as stored');
	});

	it('should initialize with cookies configured - no domain', async () => {
		setupGlobal(null, "true");

		webloader = await import(`../webloader-lite.js?foo=${Math.random()}`);

		assert.equal(window.localStorage.values['evolv:uid'], undefined, 'The user id should not be in local storage');

		assert.match(document.cookie, /(evolv:uid=)([0-9]+_[0-9]+)(; max-age=)(.+)(; path=\/)/, 'The user id should have been generated and stored in cookies');

		assert.equal(
			window.evolv.context.uid, /(evolv:uid=)([0-9]+_[0-9]+)/.exec(document.cookie)[2],
			'The evolv context should have been initialized with the same uid as stored');
	});

	it('should only set lazy uid once', async () => {
		let spy = sinon.spy(console, 'warn');

		setupGlobal(null, undefined, { evolvLazyUid: 'true' });

		webloader = await import(`../webloader-lite.js?lazy=${Math.random()}`);

		// try to set uid a second time
		window.evolv.setUid('myUid123');
		window.evolv.setUid('myUid123');

		// assert that it was called with the correct value
		assert.ok(spy.calledWith('Evolv: Cannot set UID because another client instance already exists'), 'should display a warning if uid is already set');
	});

	describe('consent checks', () => {
		it('should initialize properly', async () => {
			setupGlobal(null, undefined, { evolvRequireConsent: 'true' });

			webloader = await import(`../webloader-lite.js?lazy=${Math.random()}`);

			const scripts = document.getElementsByTagName('script');
			const links = document.getElementsByTagName('link');
			assert.equal(scripts.length, 1, 'The script should have been added');
			assert.equal(links.length, 1, 'The stylesheet should have been added');
			let uid = window.evolv.retrieve('uid', false);

			assert.ok(uid, 'The uid id should have been generated');
			assert.equal(window.evolv.context.uid, uid, 'context uid should be the same as the generated uid');

			assert.strictEqual(window.localStorage.values['evolv:uid'], undefined, 'The user id should not be stored in local storage');
			assert.strictEqual(document.cookie, "", 'The user id should not be stored in cookie storage');

			window.evolv.markConsented();

			assert.strictEqual(window.localStorage.values['evolv:uid'], uid, 'The user id should be stored in local storage, and match the generated uid');
			assert.strictEqual(document.cookie, "", 'The user id should still not be stored in cookie storage');
			assert.equal(window.evolv.context.uid, uid, 'context uid should be the same as the generated uid');
		});
	});

	describe('Passing environment id with a query parameter', () => {
		const queryEnvironmentId = 'abc';
		it('should use the environment data parameter if set', async () => {
			setupGlobal();

			webloader = await import(`../webloader-lite.js?environment=${queryEnvironmentId}&lazy=${Math.random()}`);

			assert.strictEqual(window.evolv.client.environment, attributeEnvironmentId, 'Environment id should not be overridden');
		});

		it('should use the environment data parameter if set', async () => {
			setupGlobal(null, undefined, {
				evolvEnvironment: undefined
			});

			document.currentScript.src = `../webloader-lite.js?environment=${queryEnvironmentId}&lazy=${Math.random()}`;
			webloader = await import(document.currentScript.src);

			assert.strictEqual(window.evolv.client.environment, queryEnvironmentId, 'Environment id should be overridden');
		});

		it('should use the environment data parameter if set and not the first  query param', async () => {
			setupGlobal(null, undefined, {
				evolvEnvironment: undefined
			});

			document.currentScript.src = `../webloader-lite.js?other=this&environment=${queryEnvironmentId}&lazy=${Math.random()}`;
			webloader = await import(document.currentScript.src);

			assert.strictEqual(window.evolv.client.environment, queryEnvironmentId, 'Environment id should be overridden');
		});
	});
});
