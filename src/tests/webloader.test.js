import * as assert from 'assert';
import { WindowMock, DocumentMock } from './mocks/document.mock.js';
import EvolvMock from './mocks/evolv.mock.js';

let webloader;
describe('the web loader', () => {
	afterEach(() => {
		delete global.window;
		delete global.document;
	});

	it('should initialize properly', async () => {
		const dataset = {
			evolvEnvironment: 'testing'
		};
		const document = new DocumentMock({
			currentScript: {
				dataset
			}
		});
		const window = new WindowMock({document});
		global.window = window;
		global.document = document;
		global.window.location = {
			href: 'https://test-site.com'
		};

		global.evolv = {
			client: new EvolvMock()
		};

		webloader = await import('../webloader.js');
		const scripts = document.getElementsByTagName('script');
		const links = document.getElementsByTagName('link');
		assert.equal(scripts.length, 1, 'The script should have been added');
		assert.equal(links.length, 1, 'The stylesheet should have been added');
		assert.ok(window.localStorage.values['evolv_uid'], 'The user id should have been generated and stored');
		assert.ok(window.sessionStorage.values['evolv_sid'], 'The session id should have been generated and stored');
		assert.ok(window.evolv.context, 'The evolv context should have been exposed');
		assert.ok(window.evolv.client, 'The evolv client should have been exposed');
		assert.ok(window.evolv.assetManager, 'The evolv assetManager should have been exposed');
		assert.equal(
			window.evolv.context.uid, window.localStorage.values['evolv_uid'],
			'The evolv context should have been initialized with the same uid as stored');
		assert.equal(
			window.evolv.context.sid, window.sessionStorage.values['evolv_sid'],
			'The evolv context should have been initialized with the same sid as stored');
	});
});
