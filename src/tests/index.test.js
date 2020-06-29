
import * as assert from 'assert';

import EvolvAssetManager from '../index.js';
import { DocumentMock, StyleSheetMock, ScriptMock } from './mocks/document.mock.js';
import EvolvMock from './mocks/evolv.mock.js';
import wait from './wait.js';

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

function generateErroringJsVariant(invokedJavascript) {
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
				reject('I broke');
			});
		},
		'evolv_web_page1_variable2': () => {
			return new Promise((resolve, reject) => {
				invokedJavascript.push('evolv_web_page1_variable2');
				reject('I also broke');
			});
		}
	}
}

describe('asset manager handles correctly', () => {
	const evolvCssAssetSrc = 'https://participants-test.evolv.ai/v1/testenv/test-uid/assets.css';
	const evolvJsAssetSrc = 'https://participants-test.evolv.ai/v1/testenv/test-uid/assets.js';
	const options = {
		user: {
			uid: 'test-uid',
			sid: 'test-sid'
		}
	};

    let origWindow;
    beforeEach(function(){
        origWindow = global.window;
    });

    afterEach(function(){
        global.window = origWindow;
    });

	describe('given no assets on page', () => {
		describe('given no active keys', () => {
			let origWindow;
			beforeEach(function(){
				origWindow = global.window;
				global.window = {location: {href: 'https://test-site.com'}, evolv: {}};
			});

			afterEach(function(){
				global.window = origWindow;
			});

			it('should not add to the classlist', () => {
				global.document = new DocumentMock();
				const client = new EvolvMock();
				new EvolvAssetManager(client);
				assert.equal(document.classList.classList.length, 0)
			});
	
			it('should not confirm', () => {
				global.document = new DocumentMock();
				const client = new EvolvMock();
				new EvolvAssetManager(client);
				assert.equal(client.confirmations, 0);
				assert.equal(client.contaminations, 0);
			});
		});

		describe('given active keys', () => {
			let origWindow;

			beforeEach(function(){
				origWindow = global.window;
			});

			afterEach(function(){
				global.window = origWindow;
			});

			const keys = ['web.page1', 'web.page1.variable1', 'web.page1.variable2'];
			it('should not add to the classlist', () => {
                global.window = {location: {href: 'https://test-site.com'}, evolv: {}};
				global.document = new DocumentMock();
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client);
				assert.equal(document.classList.classList.length, 0)
			});
	
			it('should not confirm', () => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateJsVariants(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock();
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client);
				assert.equal(client.confirmations, 0);
				assert.equal(client.contaminations, 0);
			});
		});
	});

	describe('given only css assets on page', () => {
		const styleSheets = [new StyleSheetMock(evolvCssAssetSrc)];
		let origWindow;

		beforeEach(function(){
			origWindow = global.window;
			global.window = {location: {href: 'https://test-site.com'}, evolv: {}};
		});

		afterEach(function(){
			global.window = origWindow;
		});

		describe('given no active keys', () => {
			it('should not add to the classlist', () => {
				global.document = new DocumentMock({elements: styleSheets, styleSheets});
				const client = new EvolvMock();
				new EvolvAssetManager(client);
				assert.equal(document.classList.classList.length, 0)
			});
	
			it('should not confirm', () => {
				global.document = new DocumentMock({elements: styleSheets, styleSheets});
				const client = new EvolvMock();
				new EvolvAssetManager(client);
				assert.equal(client.confirmations, 0);
				assert.equal(client.contaminations, 0);
			});
		});

		describe('given active keys', () => {
			beforeEach(function(){
				origWindow = global.window;
			});

			afterEach(function(){
				global.window = origWindow;
			});

			const keys = ['web.page1', 'web.page1.variable1', 'web.page1.variable2'];

			it('should add class names to the document classlist', () => {
				global.document = new DocumentMock({elements: styleSheets, styleSheets});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client);
				assert.equal(document.classList.classList.length, 3);
				assert.deepEqual(document.classList.classList, [
					'evolv_web_page1',
					'evolv_web_page1_variable1',
					'evolv_web_page1_variable2']);
			});
	
			it('should confirm once', () => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateJsVariants(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: styleSheets, styleSheets});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client);
				assert.equal(client.confirmations, 1);
				assert.equal(client.contaminations, 0);
			});
		});
	});

	describe('given only js assets on page', () => {
		const scripts = [new ScriptMock(evolvJsAssetSrc)];

		describe('given no active keys', () => {
			let origWindow;
			beforeEach(function(){
				origWindow = global.window;
			});

			afterEach(function(){
				global.window = origWindow;
			});

			it('should not add class names to the document classlist', () => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateJsVariants(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: scripts, scripts});
				const client = new EvolvMock();
				new EvolvAssetManager(client);
				assert.equal(document.classList.classList.length, 0);
			});

			it('should not invoke javascript', () => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateJsVariants(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: scripts, scripts});
				const client = new EvolvMock();
				new EvolvAssetManager(client);
				assert.equal(invokedJavascript.length, 0);
			});
	
			it('should not confirm', async() => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateJsVariants(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: scripts, scripts});
				const client = new EvolvMock();
				new EvolvAssetManager(client);
				await wait(0);
				assert.equal(client.confirmations, 0);
				assert.equal(client.contaminations, 0);
			});
		});

		describe('given active keys', () => {
			let origWindow;
			beforeEach(function(){
				origWindow = global.window;
			});

			afterEach(function(){
				global.window = origWindow;
			});

			const keys = ['web.page1', 'web.page1.variable1', 'web.page1.variable2'];

			it('should not add class names to the document classlist', () => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateJsVariants(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: scripts, scripts});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client);
				assert.equal(document.classList.classList.length, 0)
			});

			it('should invoke javscript', () => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateJsVariants(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: scripts, scripts});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client);
				assert.equal(invokedJavascript.length, 3);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable2') > -1);
			});
	
			it('should confirm once', async() => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateJsVariants(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: scripts, scripts});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client);

				await wait(0);
				assert.equal(client.confirmations, 1);
				assert.equal(client.contaminations, 0);
			});
		});
	});

	describe('given css and js assets on page', () => {
		const styleSheets = [new StyleSheetMock(evolvCssAssetSrc)];
		const scripts = [new ScriptMock(evolvJsAssetSrc)];

		describe('given no active keys', () => {
			let origWindow;
			beforeEach(function(){
				origWindow = global.window;
			});

			afterEach(function(){
				global.window = origWindow;
			});

			it('should not add class names to the document classlist', () => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateJsVariants(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: styleSheets.concat(scripts), styleSheets, scripts});
				const client = new EvolvMock();
				new EvolvAssetManager(client);
				assert.equal(document.classList.classList.length, 0)
			});

			it('should not invoke javascript', () => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateJsVariants(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: styleSheets.concat(scripts), styleSheets, scripts});
				const client = new EvolvMock();
				new EvolvAssetManager(client);
				assert.equal(invokedJavascript.length, 0);
			});
	
			it('should not confirm', async() => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateJsVariants(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: styleSheets.concat(scripts), styleSheets, scripts});
				const client = new EvolvMock();
				new EvolvAssetManager(client);
				await wait(0);
				assert.equal(client.confirmations, 0);
				assert.equal(client.contaminations, 0);
			});
		});

		describe('given active keys', () => {
			let origWindow;
			beforeEach(function(){
				origWindow = global.window;
			});

			afterEach(function(){
				global.window = origWindow;
			});

			const keys = ['web.page1', 'web.page1.variable1', 'web.page1.variable2'];

			it('should add class names to the document classlist', () => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateJsVariants(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: styleSheets.concat(scripts), styleSheets, scripts});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client);
				assert.equal(document.classList.classList.length, 3);
				assert.deepEqual(document.classList.classList, [
					'evolv_web_page1', 'evolv_web_page1_variable1', 'evolv_web_page1_variable2'])
			});

			it('should invoke javscript', () => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateJsVariants(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: styleSheets.concat(scripts), styleSheets, scripts});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client);
				assert.equal(invokedJavascript.length, 3);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable2') > -1);
			});
	
			it('should confirm once', async() => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateJsVariants(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: styleSheets.concat(scripts), styleSheets, scripts});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client);
				await wait(0);
				assert.equal(client.confirmations, 1);
				assert.equal(client.contaminations, 0);
			});
		});

		describe('given active keys with an error', () => {
			let origWindow;
			beforeEach(function(){
				origWindow = global.window;
			});

			afterEach(function(){
				global.window = origWindow;
			});

			const keys = ['web.page1', 'web.page1.variable1', 'web.page1.variable2'];

			it('should add class names to the document classlist', () => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateErroringJsVariant(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: styleSheets.concat(scripts), styleSheets, scripts});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client);
				assert.equal(document.classList.classList.length, 3);
				assert.deepEqual(document.classList.classList, [
					'evolv_web_page1', 'evolv_web_page1_variable1', 'evolv_web_page1_variable2'])
			});

			it('should invoke javscript', () => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateErroringJsVariant(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: styleSheets.concat(scripts), styleSheets, scripts});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client);
				assert.equal(invokedJavascript.length, 3);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable2') > -1);
			});

			it('should contaminate once', async() => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateErroringJsVariant(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: styleSheets.concat(scripts), styleSheets, scripts});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client);
				await wait(0);
				assert.equal(client.confirmations, 0);
				assert.equal(client.contaminations, 1);
			});
		});
	});
});
