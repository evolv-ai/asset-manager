
import * as assert from 'assert';

import EvolvAssetManager from '../index.js';
import { DocumentMock, StyleSheetMock, ScriptMock } from './mocks/document.mock.js';
import EvolvMock from './mocks/evolv.mock.js';
import wait from './wait.js';
import sinon from 'sinon';

function mockTiming(offset) {
  return { timing: { domContentLoadedEventStart: (new Date()).getTime() -  offset }};
}

function mockRunner() {
  const mockObject =  {
    updateFunctionsToRun: function(keys) {}
  };

  sinon.spy(mockObject, 'updateFunctionsToRun');

  return mockObject;
}

function generateJsVariants(invokedJavascript) {
	return {
		'evolv_web_page1': (resolve, reject) => {
			invokedJavascript.push('evolv_web_page1');
		},
		'evolv_web_page1_variable1': (resolve, reject) => {
			invokedJavascript.push('evolv_web_page1_variable1');
		},
		'evolv_web_page1_variable2': (resolve, reject) => {
			invokedJavascript.push('evolv_web_page1_variable2');
		},
		'evolv_web_page2': (resolve, reject) => {
			invokedJavascript.push('evolv_web_page2');
		},
		'evolv_web_page2_variable1': (resolve, reject) => {
			invokedJavascript.push('evolv_web_page2_variable1');
		},
		'evolv_web_page2_variable2': (resolve, reject) => {
			invokedJavascript.push('evolv_web_page2_variable2');
		}
	}
}

function generateErroringJsVariant(invokedJavascript) {
	return {
		'evolv_web_page1': (resolve, reject) => {
			invokedJavascript.push('evolv_web_page1');
		},
		'evolv_web_page1_variable1': (resolve, reject) => {
			invokedJavascript.push('evolv_web_page1_variable1');
			throw new Error('I broke');
		},
		'evolv_web_page1_variable2': (resolve, reject) => {
			invokedJavascript.push('evolv_web_page1_variable2');
			setTimeout(function() {
				reject('I also broke');
			}, 10);

			return true;
		}
	}
}

function generateSingleErroringJsVariant(invokedJavascript) {
	return {
		'evolv_web_page1_variable2': (resolve, reject) => {
			invokedJavascript.push('evolv_web_page1_variable2');
			setTimeout(function() {
				reject('I broke');
			}, 10);

			return true;
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
				new EvolvAssetManager(client, undefined, mockTiming());
				assert.equal(document.classList.classList.length, 0)
			});

			it('should not confirm', () => {
				global.document = new DocumentMock();
				const client = new EvolvMock();
				new EvolvAssetManager(client, undefined, mockTiming());
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
				new EvolvAssetManager(client, undefined, mockTiming());
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
				new EvolvAssetManager(client, undefined, mockTiming())
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
				new EvolvAssetManager(client, undefined, mockTiming());
				assert.equal(document.classList.classList.length, 0)
			});

			it('for just stylesheets - will still confirm - but there is nothing to confirm into', () => {
				global.document = new DocumentMock({elements: styleSheets, styleSheets});
				const client = new EvolvMock();
				new EvolvAssetManager(client, undefined, mockTiming());
				assert.equal(client.confirmations, 1);
				assert.equal(client.contaminations, 0);
			});

      it('for just javascript - will still confirm - but there is nothing to confirm into', () => {
        const scripts = [new StyleSheetMock(evolvCssAssetSrc), new ScriptMock(evolvJsAssetSrc)];
        global.document = new DocumentMock({elements: scripts, scripts});
        const client = new EvolvMock();
        const _mockRunner = mockRunner();
        new EvolvAssetManager(client, undefined, mockTiming(), _mockRunner);
        assert.equal(true, _mockRunner.updateFunctionsToRun.calledOnce);
        assert.deepStrictEqual([], _mockRunner.updateFunctionsToRun.getCall(0).args[0]);
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
				new EvolvAssetManager(client, undefined, mockTiming());
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
				new EvolvAssetManager(client, undefined, mockTiming());
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
				new EvolvAssetManager(client, undefined, mockTiming());
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
				new EvolvAssetManager(client, undefined, mockTiming());
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
				new EvolvAssetManager(client, undefined, mockTiming());
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
				new EvolvAssetManager(client, undefined, mockTiming());
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
				new EvolvAssetManager(client, undefined, mockTiming());
				assert.equal(invokedJavascript.length, 3);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable2') > -1);
			});

			it('should confirm at least once', async() => {
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
				new EvolvAssetManager(client, undefined, mockTiming());

				await wait(0);
				assert.ok(client.confirmations >= 1);
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
				new EvolvAssetManager(client, undefined, mockTiming())
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
				new EvolvAssetManager(client, undefined, mockTiming())
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
				new EvolvAssetManager(client, undefined, mockTiming())
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
				new EvolvAssetManager(client, undefined, mockTiming());
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
				new EvolvAssetManager(client, undefined, mockTiming());
				assert.equal(invokedJavascript.length, 3);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable2') > -1);
			});

			it('should not invoke javascript again until the keys are refired and not already matching', async() => {
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
				new EvolvAssetManager(client, undefined, mockTiming());
				assert.equal(invokedJavascript.length, 3);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable2') > -1);

        await wait(0);
				client.fireActiveKeyListenerNewKeys(['web.page2', 'web.page2.variable1', 'web.page2.variable2'])

				// The previous matching functions should have been cleared
				assert.equal(invokedJavascript.length, 6);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable2') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page2') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page2_variable1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page2_variable2') > -1);

        await wait(0);
				// The previous matching functions should have been cleared
				client.fireActiveKeyListenerNewKeys(['web.page2', 'web.page2.variable1', 'web.page2.variable2'])

				assert.equal(invokedJavascript.length, 6);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page1_variable2') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page2') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page2_variable1') > -1);
				assert.ok(invokedJavascript.indexOf('evolv_web_page2_variable2') > -1);

        await wait(0);
        // should refire web.page1
				client.fireActiveKeyListenerNewKeys(['web.page2', 'web.page2.variable1', 'web.page2.variable2', 'web.page1']);
				assert.equal(invokedJavascript.length, 7);
				assert.ok(invokedJavascript[6] === 'evolv_web_page1');
			});

			it('should confirm at least once', async() => {
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
				new EvolvAssetManager(client, undefined, mockTiming());
				await wait(0);
				assert.ok(client.confirmations >= 1);
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
				new EvolvAssetManager(client, undefined, mockTiming());
				assert.equal(document.classList.classList.length, 3);
				assert.deepEqual(document.classList.classList, [
					'evolv_web_page1', 'evolv_web_page1_variable1', 'evolv_web_page1_variable2'])
			});

			it('should invoke javascript', () => {
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
				new EvolvAssetManager(client, undefined, mockTiming());
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
				new EvolvAssetManager(client, undefined, mockTiming());
				await wait(40);
				assert.equal(client.confirmations, 0);
				assert.ok(client.contaminations >= 1);
			});

			it('should contaminate once - single error', async() => {
				const invokedJavascript = [];
				global.window = {
					location: {
						href: 'https://test-site.com'
					},
					evolv: {
						javascript: {
							variants: generateSingleErroringJsVariant(invokedJavascript)
						}
					}
				};
				global.document = new DocumentMock({elements: styleSheets.concat(scripts), styleSheets, scripts});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client, undefined, mockTiming());
				await wait(40);
				assert.equal(client.confirmations, 0);
				assert.equal(client.contaminations, 1);
			});
		});
	});

	describe('given only js assets on page', () => {
		const scripts = [new ScriptMock(evolvJsAssetSrc)];

		describe('given active keys and time delay threshold', () => {
			let origWindow;
			beforeEach(function(){
				origWindow = global.window;
			});

			afterEach(function(){
				global.window = origWindow;
			});

			const keys = ['web.page1', 'web.page1.variable1', 'web.page1.variable2'];

			it('should contaminate once with timeout', async() => {
				const invokedJavascript = [];

				global.window = {
					location: {
						href: 'https://test-site.com'
					}
				};

				global.document = new DocumentMock({elements: scripts, scripts});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client, { timeoutThreshold: 10}, mockTiming(20));

				global.window.evolv = {
					javascript: {
						variants: generateJsVariants(invokedJavascript)
					}
				};

				await wait(0);
				assert.equal(invokedJavascript.length, 0);
				assert.equal(client.confirmations, 0);
				assert.equal(client.contaminations, 1);
			});

			it('should not contaminate as run before timeout', async() => {
				const invokedJavascript = [];

				global.window = {
					location: {
						href: 'https://test-site.com'
					}
				};

				global.document = new DocumentMock({elements: scripts, scripts});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client, { legacyPollingInterval: 5, timeoutThreshold: 30 }, mockTiming(20));

				global.window.evolv = {
					javascript: {
						variants: generateJsVariants(invokedJavascript)
					}
				};

				await wait(200);
				assert.equal(invokedJavascript.length, 3);
				assert.ok(client.confirmations >= 1);
				assert.equal(client.contaminations, 0);
			});

			it('should not contaminate as no timeout', async() => {
				const invokedJavascript = [];

				global.window = {
					location: {
						href: 'https://test-site.com'
					}
				};

				global.document = new DocumentMock({elements: scripts, scripts});
				const client = new EvolvMock(keys);
				new EvolvAssetManager(client, {}, mockTiming(2000));

				global.window.evolv = {
					javascript: {
						variants: generateJsVariants(invokedJavascript)
					}
				};

				await wait(200);
				assert.equal(invokedJavascript.length, 3);
				assert.ok(client.confirmations >= 1);
				assert.equal(client.contaminations, 0);
			});

			it('should fire the javascript in the correct order', () => {
				const styleSheets = [new StyleSheetMock(evolvCssAssetSrc)];
				const scripts = [new ScriptMock(evolvJsAssetSrc)];
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
				new EvolvAssetManager(client, undefined, mockTiming());
				assert.equal(invokedJavascript.length, 3);
				assert.strictEqual(invokedJavascript.indexOf('evolv_web_page1'), 0);
				assert.strictEqual(invokedJavascript.indexOf('evolv_web_page1_variable1'), 1);
				assert.strictEqual(invokedJavascript.indexOf('evolv_web_page1_variable2'), 2);

				client.fireActiveKeyListenerNewKeys(['web.page2.variable1', 'web.page2', 'web.page2.variable2']);

				// The previous matching functions should have been cleared
				assert.equal(invokedJavascript.length, 6);
				assert.strictEqual(invokedJavascript.indexOf('evolv_web_page1'), 0);
				assert.strictEqual(invokedJavascript.indexOf('evolv_web_page1_variable1'), 1);
				assert.strictEqual(invokedJavascript.indexOf('evolv_web_page1_variable2'), 2);
				assert.strictEqual(invokedJavascript.indexOf('evolv_web_page2'), 3);
				assert.strictEqual(invokedJavascript.indexOf('evolv_web_page2_variable1'), 4);
				assert.strictEqual(invokedJavascript.indexOf('evolv_web_page2_variable2'), 5);
			});
		});
	});
});
