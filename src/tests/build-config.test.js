import * as assert from 'assert';

import jsdom from './mocks/jsdom.js';
import { buildConfig } from '../build-config.js';


describe('buildConfig()', () => {
	let cleanup;

	beforeEach(() => {
		cleanup = jsdom();
		global.evolv = window.evolv;
	});

	afterEach(() => {
		cleanup();
	});

	it('should return expected configuration', () => {
		// Arrange
		const script = document.createElement('script');
		document.body.appendChild(script);

		script.setAttribute('data-evolv-environment', '12345');
		script.setAttribute('data-evolv-endpoint', 'url');
		script.setAttribute('data-evolv-lazy-uid', 'true');
		script.setAttribute('data-evolv-require-consent', 'false');
		script.setAttribute('data-evolv-js', 'true');
		script.setAttribute('data-evolv-css', 'false');
		script.setAttribute('data-evolv-pushstate', 'false');
		script.setAttribute('data-evolv-timeout', '100');
		script.setAttribute('data-evolv-use-cookies', 'evolv.ai');
		script.setAttribute('data-evolv-profile-id', 'rob');

		// Act
		const config = buildConfig(script.dataset);

		// Assert
		assert.strictEqual(config.environment, '12345');
		assert.strictEqual(config.endpoint, 'url');
		assert.strictEqual(config.lazyUid, true);
		assert.strictEqual(config.requireConsent, false);
		assert.strictEqual(config.js, true);
		assert.strictEqual(config.css, false);
		assert.strictEqual(config.pushstate, false);
		assert.strictEqual(config.timeout, 100);
		assert.strictEqual(config.useCookies, 'evolv.ai');
		assert.strictEqual(config.profileId, 'rob');
	});

	describe('when data-evolv-timeout is omitted', () => {
		it('should return configuration with undefined timeout', () => {
			// Arrange
			const script = document.createElement('script');
			document.body.appendChild(script);

			// Act
			const config = buildConfig(script.dataset);

			// Assert
			assert.strictEqual(config.timeout, undefined);
		});
	});

	describe('when data-evolv-timeout is 100', () => {
		it('should return configuration with timeout equal to 100', () => {
			// Arrange
			const script = document.createElement('script');
			document.body.appendChild(script);
			script.setAttribute('data-evolv-timeout', '100');

			// Act
			const config = buildConfig(script.dataset);

			// Assert
			assert.strictEqual(config.timeout, 100);
		});
	});

	describe('when data-evolv-timeout has non-numeric characters', () => {
		it('should return configuration with undefined timeout', () => {
			// Arrange
			const script = document.createElement('script');
			document.body.appendChild(script);
			script.setAttribute('data-evolv-timeout', '200xyz');

			// Act
			const config = buildConfig(script.dataset);

			// Assert
			assert.strictEqual(config.timeout, undefined);
		});
	});

	describe('data-evolv-capture', () => {
		it('should be undefined when not set', () => {
			// Arrange
			const script = document.createElement('script');
			document.body.appendChild(script);

			// Act
			const config = buildConfig(script.dataset);

			// Assert
			assert.strictEqual(config.capture, undefined);
		});

		it('should be 1 when true', () => {
			// Arrange
			const script = document.createElement('script');
			document.body.appendChild(script);
			script.setAttribute('data-evolv-capture', 'true');

			// Act
			const config = buildConfig(script.dataset);

			// Assert
			assert.strictEqual(config.capture, 1);
		});

		it('should be undefined when false', () => {
			// Arrange
			const script = document.createElement('script');
			document.body.appendChild(script);
			script.setAttribute('data-evolv-capture', 'false');

			// Act
			const config = buildConfig(script.dataset);

			// Assert
			assert.strictEqual(config.capture, undefined);
		});

		it('should be a number when set to a number', () => {
			// Arrange
			const script = document.createElement('script');
			document.body.appendChild(script);
			script.setAttribute('data-evolv-capture', '17.8');

			// Act
			const config = buildConfig(script.dataset);

			// Assert
			assert.strictEqual(config.capture, 17.8);
		});

		it('should be undefined when set to a garbage string', () => {
			// Arrange
			const script = document.createElement('script');
			document.body.appendChild(script);
			script.setAttribute('data-evolv-capture', 'garbageString#$%^&*');

			// Act
			const config = buildConfig(script.dataset);

			// Assert
			assert.strictEqual(config.capture, undefined);
		});
	});
});
