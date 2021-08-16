import * as assert from "assert";
import EvolvStorageManager from "../storage.js";
import { DocumentMock, WindowMock } from "./mocks/document.mock.js";

describe('storage checks', () => {

	beforeEach(() => {
		const document = new DocumentMock({
			cookie: ''
		});

		global.window = new WindowMock({ document });
		global.document = document;
	});

	it('should store correctly with local storage', async () => {
		let evolvStorageManager = new EvolvStorageManager(undefined, true);

		evolvStorageManager.store('key', 'value', false);
		assert.strictEqual(evolvStorageManager.retrieve('key', false), 'value', 'Stored value retrieved');
		assert.strictEqual(evolvStorageManager.retrieve('key', true), undefined, 'Not in session storage');

		assert.strictEqual(window.localStorage.getItem('evolv:key'), 'value', 'Stored in local storage');
		assert.strictEqual(window.document.cookie, '', 'Not stored in cookie storage');
		assert.strictEqual(window.sessionStorage.getItem('evolv:key'), undefined, 'Not stored in session storage');
	});

	it('should store correctly with session storage', async () => {
		let evolvStorageManager = new EvolvStorageManager(undefined, true);

		evolvStorageManager.store('key', 'value', true);
		assert.strictEqual(evolvStorageManager.retrieve('key', true), 'value', 'Stored value retrieved');
		assert.strictEqual(evolvStorageManager.retrieve('key', false), undefined, 'Not in local storage');

		assert.strictEqual(window.localStorage.getItem('evolv:key'), undefined, 'Not stored in local storage');
		assert.strictEqual(window.document.cookie, '', 'Not stored in cookie storage');
		assert.strictEqual(window.sessionStorage.getItem('evolv:key'), 'value', 'Stored in session storage');
	});

	it('should store correctly with cookie storage', async () => {
		let evolvStorageManager = new EvolvStorageManager('true', true);

		evolvStorageManager.store('key', 'value', false);
		evolvStorageManager.store('key2', 'value2', true);

		assert.equal(evolvStorageManager.retrieve('key', false), 'value', 'Stored value retrieved');
		assert.equal(evolvStorageManager.retrieve('key', true), undefined, 'Not in session storage');

		assert.equal(window.localStorage.getItem('evolv:key'), undefined, 'Not stored in local storage');
		assert.match(window.document.cookie, /evolv:key=value/, 'Stored in cookie storage');
		assert.equal(window.sessionStorage.getItem('evolv:key'), undefined, 'Not stored in session storage');


		assert.strictEqual(evolvStorageManager.retrieve('key2', true), 'value2', 'Stored value retrieved');
		assert.equal(evolvStorageManager.retrieve('key2', false), undefined, 'Not in local storage');

		assert.equal(window.localStorage.getItem('evolv:key2'), undefined, 'Not stored in local storage');
		assert.match(window.document.cookie, /evolv:key=value/, 'Not stored in cookie storage');
		assert.equal(window.sessionStorage.getItem('evolv:key2'), 'value2', 'Not stored in session storage');
	});

	it('should store correctly with non persistent storage', async () => {
		let evolvStorageManager = new EvolvStorageManager(undefined, false);

		evolvStorageManager.store('key', 'value', false);
		evolvStorageManager.store('key2', 'value2', true);

		assert.equal(evolvStorageManager.retrieve('key', false), 'value', 'Stored value retrieved');
		assert.equal(evolvStorageManager.retrieve('key', true), undefined, 'Not in session storage');

		assert.equal(window.localStorage.getItem('evolv:key'), undefined, 'Not stored in local storage');
		assert.equal(window.document.cookie, '', 'Not stored in cookie storage');
		assert.equal(window.sessionStorage.getItem('evolv:key'), undefined, 'Not stored in session storage');


		assert.strictEqual(evolvStorageManager.retrieve('key2', true), 'value2', 'Stored value retrieved');
		assert.equal(evolvStorageManager.retrieve('key2', false), undefined, 'Not in local storage');

		assert.equal(window.localStorage.getItem('evolv:key2'), undefined, 'Not stored in local storage');
		assert.equal(window.document.cookie, '', 'Not stored in cookie storage');
		assert.equal(window.sessionStorage.getItem('evolv:key2'), undefined, 'Not stored in session storage');
	});

	it('should store correctly when persistence is initially disabled, but then allowed', async () => {
		let evolvStorageManager = new EvolvStorageManager(undefined, false);

		evolvStorageManager.store('key', 'value', false);
		evolvStorageManager.store('key2', 'value2', true);

		evolvStorageManager.allowPersistentStorage();

		assert.equal(evolvStorageManager.retrieve('key', false), 'value', 'Stored value retrieved');
		assert.equal(evolvStorageManager.retrieve('key', true), undefined, 'Not in session storage');

		assert.equal(window.localStorage.getItem('evolv:key'), 'value', 'Stored in local storage');
		assert.equal(window.document.cookie, '', 'Not stored in cookie storage');
		assert.equal(window.sessionStorage.getItem('evolv:key'), undefined, 'Not stored in session storage');


		assert.strictEqual(evolvStorageManager.retrieve('key2', true), 'value2', 'Stored value retrieved');
		assert.equal(evolvStorageManager.retrieve('key2', false), undefined, 'Not in local storage');

		assert.equal(window.localStorage.getItem('evolv:key2'), undefined, 'Not stored in local storage');
		assert.equal(window.document.cookie, '', 'Not stored in cookie storage');
		assert.equal(window.sessionStorage.getItem('evolv:key2'), 'value2', 'Not stored in session storage');
	});

	it('should retrieve from the persistent store if the data is there', () => {
		let evolvStorageManager = new EvolvStorageManager(undefined, false);

		window.localStorage.setItem('evolv:key1', 'value1');
		window.sessionStorage.setItem('evolv:key2', 'value2');

		assert.equal(evolvStorageManager.retrieve('key1', false), 'value1', 'persistent value should be retrieved feom local store');
		assert.equal(evolvStorageManager.retrieve('key2', true), 'value2', 'persistent value should be retrieved from session store');
	});
});
