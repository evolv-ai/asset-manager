
import * as assert from 'assert';

import { main } from '../index.js';
import { DocumentMock, ElementMock } from './mocks/document.mock.js';
import EvolvMock from './mocks/evolv.mock.js';

function generateJsVariants(invokedJavascript) {
	return {
		'evolv_web_page1': () => {
			return new Promise((resolve, reject) => {
				invokedJavascript.push('evolv_web_page1');
				resolve(true);
			});
		},
		'evolv_web_page1_variable1': () => {
			return new Promise((resolve, reject) => {
				invokedJavascript.push('evolv_web_page1_variable1');
				resolve(true);
			});
		},
		'evolv_web_page1_variable2': () => {
			return new Promise((resolve, reject) => {
				invokedJavascript.push('evolv_web_page1_variable2');
				resolve(true);
			});
		}
	}
}

describe('asset manager handles correctly', () => {
	const evolvCssAssetSrc = 'https://participants-test.evolv.ai/v1/testenv/test-uid/assets.css'
	const evolvJsAssetSrc = 'https://participants-test.evolv.ai/v1/testenv/test-uid/assets.js'
	const options = {
		user: {
			uid: 'test-uid',
			sid: 'test-sid'
		}
	}

	describe('given no assets on page', () => {
		global.window = {location: {href: 'https://test-site.com'}, _evolv: {}}

		describe('given no active keys', () => {
			it('should initialize', () => {
				global.document = new DocumentMock();
				const client = new EvolvMock();
				main(client, options);
				assert.equal(client.initializations, 1);
			});

			it('should not add to the classlist', () => {
				global.document = new DocumentMock();
				const client = new EvolvMock();
				main(client, options);
				assert.equal(document.classList.classList.length, 0)
			});
	
			it('should not confirm', () => {
				global.document = new DocumentMock();
				const client = new EvolvMock();
				main(client, options);
				assert.equal(client.confirmations, 0);
			});
		});

		describe('given active keys', () => {
			const keys = ['web.page1', 'web.page1.variable1', 'web.page1.variable2']

			it('should initialize', () => {
				global.document = new DocumentMock();
				const client = new EvolvMock(keys);
				main(client, options);
				assert.equal(client.initializations, 1);
			});

			it('should not add to the classlist', () => {
				global.document = new DocumentMock();
				const client = new EvolvMock(keys);
				main(client, options);
				assert.equal(document.classList.classList.length, 0)
			});
	
			it('should not confirm', () => {
				global.document = new DocumentMock();
				const client = new EvolvMock(keys);
				main(client, options);
				assert.equal(client.confirmations, 0);
			});
		});
	});

	describe('given only css assets on page', () => {
		const elements = [new ElementMock('link', evolvCssAssetSrc, 'stylesheet')]
		global.window = {location: {href: 'https://test-site.com'}, _evolv: {}}

		describe('given no active keys', () => {
			it('should initialize', () => {
				global.document = new DocumentMock(elements);
				const client = new EvolvMock();
				main(client, options);
				assert.equal(client.initializations, 1);
			});

			it('should not add to the classlist', () => {
				global.document = new DocumentMock(elements);
				const client = new EvolvMock();
				main(client, options);
				assert.equal(document.classList.classList.length, 0)
			});
	
			it('should not confirm', () => {
				global.document = new DocumentMock(elements);
				const client = new EvolvMock();
				main(client, options);
				assert.equal(client.confirmations, 0);
			});
		});

		describe('given active keys', () => {
			const keys = ['web.page1', 'web.page1.variable1', 'web.page1.variable2']

			it('should initialize', () => {
				global.document = new DocumentMock(elements);
				const client = new EvolvMock(keys);
				main(client, options);
				assert.equal(client.initializations, 1);
			});

			it('should add class names to the document classlist', () => {
				global.document = new DocumentMock(elements);
				const client = new EvolvMock(keys);
				main(client, options);
				assert.equal(document.classList.classList.length, 3)
				assert.deepEqual(document.classList.classList, ['evolv_web_page1', 'evolv_web_page1_variable1', 'evolv_web_page1_variable2'])
			});
	
			it('should confirm once', () => {
				global.document = new DocumentMock(elements);
				const client = new EvolvMock(keys);
				main(client, options);
				assert.equal(client.confirmations, 1);
			});
		});
	});

	describe('given only js assets on page', () => {
		const elements = [new ElementMock('script', evolvJsAssetSrc)]

		describe('given no active keys', () => {
			it('should initialize', () => {
				const invokedJavascript = [];
				global.window = {location: {href: 'https://test-site.com'}, _evolv: { javascript: { variants: generateJsVariants(invokedJavascript)}}}			
				global.document = new DocumentMock(elements);
				const client = new EvolvMock();
				main(client, options);
				assert.equal(client.initializations, 1);
			});

			it('should not add class names to the document classlist', () => {
				const invokedJavascript = [];
				global.window = {location: {href: 'https://test-site.com'}, _evolv: { javascript: { variants: generateJsVariants(invokedJavascript)}}}	
				global.document = new DocumentMock(elements);
				const client = new EvolvMock();
				main(client, options);
				assert.equal(document.classList.classList.length, 0)
			});

			it('should not invoke javascript', () => {
				const invokedJavascript = [];
				global.window = {location: {href: 'https://test-site.com'}, _evolv: { javascript: { variants: generateJsVariants(invokedJavascript)}}}	
				global.document = new DocumentMock(elements);
				const client = new EvolvMock();
				main(client, options);
				assert.equal(invokedJavascript.length, 0)
			});
	
			// it('should not confirm', () => {
			// 	invokedJavascript = []
			// 	global.document = new DocumentMock(elements);
			// 	const client = new EvolvMock();
			// 	main(client, options);
			// 	assert.equal(client.confirmations, 0);
			// });
		});

		describe('given active keys', () => {
			const keys = ['web.page1', 'web.page1.variable1', 'web.page1.variable2']

			it('should initialize', () => {
				const invokedJavascript = [];
				global.window = {location: {href: 'https://test-site.com'}, _evolv: { javascript: { variants: generateJsVariants(invokedJavascript)}}}	
				global.document = new DocumentMock(elements);
				const client = new EvolvMock(keys);
				main(client, options);
				assert.equal(client.initializations, 1);
			});

			it('should not add class names to the document classlist', () => {
				const invokedJavascript = [];
				global.window = {location: {href: 'https://test-site.com'}, _evolv: { javascript: { variants: generateJsVariants(invokedJavascript)}}}	
				global.document = new DocumentMock(elements);
				const client = new EvolvMock(keys);
				main(client, options);
				assert.equal(document.classList.classList.length, 0)
			});

			it('should invoke javscript', () => {
				const invokedJavascript = [];
				global.window = {location: {href: 'https://test-site.com'}, _evolv: { javascript: { variants: generateJsVariants(invokedJavascript)}}}	
				global.document = new DocumentMock(elements);
				const client = new EvolvMock(keys);
				main(client, options);
				assert.equal(invokedJavascript.length, 3)
				assert.ok(invokedJavascript.indexOf('evolv_web_page1') > -1)
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable1') > -1)
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable2') > -1)
			});
	
			// it('should confirm once', () => {
			// 	invokedJavascript = [];
			// 	global.document = new DocumentMock(elements);
			// 	const client = new EvolvMock(keys);
			// 	main(client, options);
			// 	setTimeout(assert.equal(client.confirmations, 1), 10000);
			// });
		});
	});

	describe('given css and js assets on page', () => {
		const elements = [new ElementMock('link', evolvCssAssetSrc, 'stylesheet'), new ElementMock('script', evolvJsAssetSrc)];

		describe('given no active keys', () => {
			it('should initialize', () => {
				const invokedJavascript = [];
				global.window = {location: {href: 'https://test-site.com'}, _evolv: { javascript: { variants: generateJsVariants(invokedJavascript)}}}	
				global.document = new DocumentMock(elements);
				const client = new EvolvMock();
				main(client, options);
				assert.equal(client.initializations, 1);
			});

			it('should not add class names to the document classlist', () => {
				const invokedJavascript = [];
				global.window = {location: {href: 'https://test-site.com'}, _evolv: { javascript: { variants: generateJsVariants(invokedJavascript)}}}	
				global.document = new DocumentMock(elements);
				const client = new EvolvMock();
				main(client, options);
				assert.equal(document.classList.classList.length, 0)
			});

			it('should not invoke javascript', () => {
				const invokedJavascript = [];
				global.window = {location: {href: 'https://test-site.com'}, _evolv: { javascript: { variants: generateJsVariants(invokedJavascript)}}}	
				global.document = new DocumentMock(elements);
				const client = new EvolvMock();
				main(client, options);
				assert.equal(invokedJavascript.length, 0)
			});
	
			// it('should not confirm', () => {
			// 	invokedJavascript = []
			// 	global.document = new DocumentMock(elements);
			// 	const client = new EvolvMock();
			// 	main(client, options);
			// 	assert.equal(client.confirmations, 0);
			// });
		});

		describe('given active keys', () => {
			const keys = ['web.page1', 'web.page1.variable1', 'web.page1.variable2']

			it('should initialize', () => {
				const invokedJavascript = [];
				global.window = {location: {href: 'https://test-site.com'}, _evolv: { javascript: { variants: generateJsVariants(invokedJavascript)}}}	
				global.document = new DocumentMock(elements);
				const client = new EvolvMock(keys);
				main(client, options);
				assert.equal(client.initializations, 1);
			});

			it('should add class names to the document classlist', () => {
				const invokedJavascript = [];
				global.window = {location: {href: 'https://test-site.com'}, _evolv: { javascript: { variants: generateJsVariants(invokedJavascript)}}}	
				global.document = new DocumentMock(elements);
				const client = new EvolvMock(keys);
				main(client, options);
				assert.equal(document.classList.classList.length, 3)
				assert.deepEqual(document.classList.classList, ['evolv_web_page1', 'evolv_web_page1_variable1', 'evolv_web_page1_variable2'])
			});

			it('should invoke javscript', () => {
				const invokedJavascript = [];
				global.window = {location: {href: 'https://test-site.com'}, _evolv: { javascript: { variants: generateJsVariants(invokedJavascript)}}}	
				global.document = new DocumentMock(elements);
				const client = new EvolvMock(keys);
				main(client, options);
				assert.equal(invokedJavascript.length, 3)
				assert.ok(invokedJavascript.indexOf('evolv_web_page1') > -1)
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable1') > -1)
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable2') > -1)
			});
	
			// it('should confirm once', () => {
			// 	invokedJavascript = [];
			// 	global.document = new DocumentMock(elements);
			// 	const client = new EvolvMock(keys);
			// 	main(client, options);
			// 	setTimeout(assert.equal(client.confirmations, 1), 10000);
			// });
		});
	});
});
