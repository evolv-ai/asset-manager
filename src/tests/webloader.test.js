import * as assert from 'assert';
import { WindowMock, DocumentMock } from './mocks/document.mock.js';
import EvolvMock from './mocks/evolv.mock.js';

let webloader;
describe('the web loader', () => {
	afterEach(() => {
		delete global.window;
		delete global.document;
	});

	function setupGlobal(doNotTrack, useCookiesDomain) {
		const dataset = {
			evolvEnvironment: 'testing',
			evolvUseCookies: useCookiesDomain
		};

		const document = new DocumentMock({
			cookie: '',
			currentScript: {
				dataset
			}
		});
		const window = new WindowMock({document});
		const navigator = { doNotTrack: doNotTrack };
		global.window = window;
		global.document = document;
		global.window.location = {
			href: 'https://test-site.com',
			hash: ''
		};
		global.navigator = navigator;

		global.evolv = {
			client: new EvolvMock()
		};
	}

	it('should initialize properly', async () => {
		setupGlobal(null);

		webloader = await import('../webloader.js');
		const scripts = document.getElementsByTagName('script');
		const links = document.getElementsByTagName('link');
		assert.equal(scripts.length, 1, 'The script should have been added');
		assert.equal(links.length, 1, 'The stylesheet should have been added');
		assert.ok(window.localStorage.values['evolv:uid'], 'The user id should have been generated and stored');
		assert.ok(window.sessionStorage.values['evolv:sid'], 'The session id should have been generated and stored');
		assert.ok(window.evolv.context, 'The evolv context should have been exposed');
		assert.ok(window.evolv.client, 'The evolv client should have been exposed');
		assert.ok(window.evolv.assetManager, 'The evolv assetManager should have been exposed');
		assert.equal(
			window.evolv.context.uid, window.localStorage.values['evolv:uid'],
			'The evolv context should have been initialized with the same uid as stored');
		assert.equal(
			window.evolv.context.sid, window.sessionStorage.values['evolv:sid'],
			'The evolv context should have been initialized with the same sid as stored');
	});

	it('should initialize with firefox DNT setup', async () => {
		setupGlobal('unspecified');

		webloader = await import(`../webloader.js?foo=${Math.random()}`);
		const scripts = global.document.getElementsByTagName('script');
		const links = global.document.getElementsByTagName('link');
		assert.equal(scripts.length, 1, 'The script should have been added');
		assert.equal(links.length, 1, 'The stylesheet should have been added');
		assert.ok(global.window.evolv, 'The evolv object should have been exposed');
	});

	it('should initialize with \'0\' DNT setup', async () => {
		setupGlobal('0');

		webloader = await import(`../webloader.js?foo=${Math.random()}`);

		const scripts = document.getElementsByTagName('script');
		const links = document.getElementsByTagName('link');
		assert.equal(scripts.length, 1, 'The script should have been added');
		assert.equal(links.length, 1, 'The stylesheet should have been added');
		assert.ok(window.evolv, 'The evolv object should have been exposed');
	});

	it('should not initialize with DNT true', async () => {
		setupGlobal('1');
		webloader = await import(`../webloader.js?foo=${Math.random()}`);
		const scripts = document.getElementsByTagName('script');
		const links = document.getElementsByTagName('link');
		assert.equal(scripts.length, 0, 'The script should not have been added');
		assert.equal(links.length, 0, 'The stylesheet should not have been added');
		assert.strictEqual(window.evolv, undefined,'The evolv object should not have been exposed');
	});

	it('should initialize with cookies configured and domain defined', async () => {
		setupGlobal(null, "*.example.com");

		webloader = await import(`../webloader.js?foo=${Math.random()}`);

		assert.equal(window.localStorage.values['evolv:uid'], undefined, 'The user id should not be in local storage');
		assert.ok(window.sessionStorage.values['evolv:sid'], 'The session id should have been generated and stored');
		assert.match(document.cookie, /(evolv:uid=)([0-9]+_[0-9]+)(; max-age=)(.+)(; path=\/; domain=\*\.example\.com)/, 'The user id should have been generated and stored in cookies');

		assert.equal(
			window.evolv.context.uid, /(evolv:uid=)([0-9]+_[0-9]+)/.exec(document.cookie)[2],
			'The evolv context should have been initialized with the same uid as stored');
		assert.equal(
			window.evolv.context.sid, window.sessionStorage.values['evolv:sid'],
			'The evolv context should have been initialized with the same sid as stored');
	});

	it('should initialize with cookies configured - no domain', async () => {
		setupGlobal(null, "true");

		webloader = await import(`../webloader.js?foo=${Math.random()}`);

		assert.equal(window.localStorage.values['evolv:uid'], undefined, 'The user id should not be in local storage');
		assert.ok(window.sessionStorage.values['evolv:sid'], 'The session id should have been generated and stored');

		assert.match(document.cookie, /(evolv:uid=)([0-9]+_[0-9]+)(; max-age=)(.+)(; path=\/)/, 'The user id should have been generated and stored in cookies');

		assert.equal(
			window.evolv.context.uid, /(evolv:uid=)([0-9]+_[0-9]+)/.exec(document.cookie)[2],
			'The evolv context should have been initialized with the same uid as stored');
		assert.equal(
			window.evolv.context.sid, window.sessionStorage.values['evolv:sid'],
			'The evolv context should have been initialized with the same sid as stored');
	});
});
