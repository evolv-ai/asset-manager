import * as assert from 'assert';
import { WindowMock, DocumentMock, MOCK_GA_CLIENT_ID } from './mocks/document.mock.js';
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
		assert.strictEqual(window.evolv, undefined, 'The evolv object should not have been exposed');
	});

	it('should only initialize one webloader', async () => {
		setupGlobal(null);

		webloader = await import('../webloader.js')
		var webloader2 = await import('../webloader.js?cachebust=true');

		const scripts = document.getElementsByTagName('script');
		const links = document.getElementsByTagName('link');
		assert.equal(scripts.length, 1, 'One script should have been added');
		assert.equal(links.length, 1, 'One stylesheet should have been added');
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

	it('should lazy set uid from GA client Id', async () => {
		setupGlobal(null, undefined, { evolvLazyUid: 'true' });

		webloader = await import(`../webloader.js?lazy=${Math.random()}`);

		let scripts = document.getElementsByTagName('script');
		let links = document.getElementsByTagName('link');
		assert.equal(scripts.length, 1, 'The script should have been added');
		assert.equal(links.length, 1, 'The stylesheet should have been added');
		assert.ok(scripts[0].src.indexOf(MOCK_GA_CLIENT_ID) !== 0, 'The uid should have been set.');
	});

	it('should only set lazy uid once', async () => {
		let spy = sinon.spy(console, 'warn');

		setupGlobal(null, undefined, { evolvLazyUid: 'true' });

		webloader = await import(`../webloader.js?lazy=${Math.random()}`);

		// try to set uid a second time
		window.evolv.setUid('myUid123');

		// assert that it was called with the correct value
		assert.ok(spy.calledWith('Multiple Evolv instances - please verify you have only loaded Evolv once'), 'should display a warning if uid is already set');
	});

	it('should set uid from GA if the uid is not the correct format and lazy flag is set', async () => {
		setupGlobal(null, undefined, { evolvLazyUid: 'true', evolvUid: 'GA1_2_4444444_555555' });

		webloader = await import(`../webloader.js?lazy=${Math.random()}`);

		let scripts = document.getElementsByTagName('script');
		let links = document.getElementsByTagName('link');
		assert.equal(scripts.length, 1, 'The script should have been added');
		assert.equal(links.length, 1, 'The stylesheet should have been added');
		assert.ok(scripts[0].src.indexOf(MOCK_GA_CLIENT_ID) !== 0, 'The uid should have been set.');
	});

	it('should use generated uid if GA integration times out', async () => {
		setupGlobal(null, undefined, { evolvLazyUid: 'true' });

		// overwrite ga.getAll to force integration polling method to time out
		window.ga.getAll = () => [];

		const prefix = '11';
		const ticks = 60;
		const MOCK_GENERATE_UID = `${prefix}_${ticks}`;

		// used to mock the prefix of the generated uid
		let mathRoundStub = sinon.stub(Math, 'round').returns(prefix);
		let clock = sinon.useFakeTimers();

		webloader = await import(`../webloader.js?lazy=${Math.random()}`);

		// run timers to poll for GA until timing out
		clock.tick(ticks);

		let scripts = document.getElementsByTagName('script');
		let links = document.getElementsByTagName('link');
		assert.equal(scripts.length, 1, 'The script should have been added');
		assert.equal(links.length, 1, 'The stylesheet should have been added');
		assert.ok(scripts[0].src.indexOf(MOCK_GENERATE_UID) > -1, 'The uid should have been set to generated uid.');

		clock.restore();
		mathRoundStub.restore();
	});

	it('should use UID from local storage instead if one exists and ignore lazy-uid', async () => {
		setupGlobal(null, undefined, { evolvLazyUid: 'true' });

		const MOCK_GENERATE_UID = `123_456`;

		let localStub = sinon.stub(global.window.localStorage, 'getItem').returns(MOCK_GENERATE_UID);

		webloader = await import(`../webloader.js?lazy=${Math.random()}`);

		let scripts = document.getElementsByTagName('script');
		let links = document.getElementsByTagName('link');
		assert.equal(scripts.length, 1, 'The script should have been added');
		assert.equal(links.length, 1, 'The stylesheet should have been added');
		assert.ok(scripts[0].src.indexOf(MOCK_GENERATE_UID) > -1, 'The uid should match the uid from localStorage.');

		localStub.restore();
	});

	describe('consent checks', () => {
		it('should initialize properly', async () => {
			setupGlobal(null, undefined, { evolvRequireConsent: 'true' });

			webloader = await import(`../webloader.js?lazy=${Math.random()}`);

			const scripts = document.getElementsByTagName('script');
			const links = document.getElementsByTagName('link');
			assert.equal(scripts.length, 1, 'The script should have been added');
			assert.equal(links.length, 1, 'The stylesheet should have been added');
			let uid = window.evolv.retrieve('uid', false);
			let sid = window.evolv.retrieve('sid', true);

			assert.ok(uid, 'The uid id should have been generated');
			assert.equal(window.evolv.context.uid, uid, 'context uid should be the same as the generated uid');

			assert.ok(sid, 'The session id should have been generated');
			assert.equal(window.evolv.context.sid, sid, 'context uid should be the same as the generated sid');

			assert.strictEqual(window.localStorage.values['evolv:uid'], undefined, 'The user id should not be stored in local storage');
			assert.strictEqual(document.cookie, "", 'The user id should not be stored in cookie storage');
			assert.strictEqual(window.sessionStorage.values['evolv:sid'], undefined, 'The session id should not be stored in session storage');

			window.evolv.markConsented();

			assert.strictEqual(window.localStorage.values['evolv:uid'], uid, 'The user id should be stored in local storage, and match the generated uid');
			assert.strictEqual(document.cookie, "", 'The user id should still not be stored in cookie storage');
			assert.strictEqual(window.sessionStorage.values['evolv:sid'], sid, 'The session id should not be stored in session storage');
			assert.equal(window.evolv.context.sid, sid, 'context uid should be the same as the generated sid');
			assert.equal(window.evolv.context.uid, uid, 'context uid should be the same as the generated uid');
		});
	});

	describe('Passing environment id with a query parameter', () => {
		const queryEnvironmentId = 'abc';
		it('should use the environment data parameter if set', async () => {
			setupGlobal();

			webloader = await import(`../webloader.js?environment=${queryEnvironmentId}&lazy=${Math.random()}`);

			assert.strictEqual(window.evolv.client.environment, attributeEnvironmentId, 'Environment id should not be overridden');
		});

		it('should use the environment data parameter if set', async () => {
			setupGlobal(null, undefined, {
				evolvEnvironment: undefined
			});

			document.currentScript.src = `../webloader.js?environment=${queryEnvironmentId}&lazy=${Math.random()}`;
			webloader = await import(document.currentScript.src);

			assert.strictEqual(window.evolv.client.environment, queryEnvironmentId, 'Environment id should be overridden');
		});

		it('should use the environment data parameter if set and not thefirst  query param', async () => {
			setupGlobal(null, undefined, {
				evolvEnvironment: undefined
			});

			document.currentScript.src = `../webloader.js?other=this&environment=${queryEnvironmentId}&lazy=${Math.random()}`;
			webloader = await import(document.currentScript.src);

			assert.strictEqual(window.evolv.client.environment, queryEnvironmentId, 'Environment id should be overridden');
		});
	});
});
