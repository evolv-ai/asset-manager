import * as assert from 'assert';

import jsdom from '../../tests/mocks/jsdom.js';
import qaMode, { QA_RE } from '../qa.mode.js';

describe('qaMode', () => {
	let cleanup;

	beforeEach(() => {
		cleanup = jsdom(undefined, {
			url: 'https://mydomain.com'
		});
	});

	afterEach(() => {
		cleanup();
	});

	describe('regex to find evolvCandidateToken', () => {
		it('should match correct evolvCandidateToken', () => {
			const regex = new RegExp(QA_RE);

			const result = 'evolvCandidateToken=111_111_aa11bb22'.match(regex);

			assert.ok(result)
			assert.equal(result[0], "evolvCandidateToken=111_111_aa11bb22")
			assert.equal(result[1], "111_111_aa11bb22")
			assert.equal(result[2], "111")
			assert.equal(result[3], "111")
			assert.equal(result[4], "aa11bb22")
		});

		it('should match correct evolvCandidateToken with env id only numbers', () => {
			const regex = new RegExp(QA_RE);

			const result = 'evolvCandidateToken=111_111_11223344'.match(regex);

			assert.ok(result)
			assert.equal(result[0], "evolvCandidateToken=111_111_11223344")
			assert.equal(result[1], "111_111_11223344")
			assert.equal(result[2], "111")
			assert.equal(result[3], "111")
			assert.equal(result[4], "11223344")
		});

		it('should not match correct evolvCandidateToken with env id only letters', () => {
			const regex = new RegExp(QA_RE);

			const result = 'evolvCandidateToken=111_111_aabbccdd'.match(regex);

			assert.ok(result)
			assert.equal(result[0], "evolvCandidateToken=111_111_aabbccdd")
			assert.equal(result[1], "111_111_aabbccdd")
			assert.equal(result[2], "111")
			assert.equal(result[3], "111")
			assert.equal(result[4], "aabbccdd")
		});

		it('should not match incorrect evolvCandidateToken', () => {
			const regex = new RegExp(QA_RE);

			const result = 'evolvCandidateToken=111_111:aabbccdd'.match(regex);

			assert.equal(result, null)
		});
	});

	describe('shouldActivate()', () => {
		it('should return true if environment id matches token', () => {
			// Arrange
			const environmentId = 'aa11bb22';
			window.location.hash = 'evolvCandidateToken=111_111_aa11bb22';

			// Act
			const result = qaMode.shouldActivate(environmentId);

			// Assert
			assert.ok(result);
		});

		describe('when url includes another parameter in its hash before "evolvCandidateToken"', () => {
			it('should return true if environment id matches token', () => {
				// Arrange
				const environmentId = 'aa11bb22';
				window.location.hash = 'anotherParam=123&evolvCandidateToken=111_111_aa11bb22';

				// Act
				const result = qaMode.shouldActivate(environmentId);

				// Assert
				assert.ok(result);
			});
		});

		describe('when url includes another parameter in its hash after "evolvCandidateToken"', () => {
			it('should return true if environment id matches token', () => {
				// Arrange
				const environmentId = 'aa11bb22';
				window.location.hash = 'evolvCandidateToken=111_111_aa11bb22&anotherParam=123';

				// Act
				const result = qaMode.shouldActivate(environmentId);

				// Assert
				assert.ok(result);
			});
		});

		it('should return false if environment id does not match token', () => {
			// Arrange
			const environmentId = 'bb22cc33';
			window.location.hash = 'evolvCandidateToken=111_111_aa11bb22';

			// Act
			const result = qaMode.shouldActivate(environmentId);

			// Assert
			assert.equal(result, false);
		});

		describe('activate()', () => {
			it('should strip "evolvCandidateToken" from hash and store in sessionStorage', () => {
				// Arrange
				window.location.hash = 'evolvCandidateToken=111_111_aa11bb22';

				// Act
				qaMode.activate();

				// Assert
				assert.equal(window.location, 'https://mydomain.com/');
				assert.equal(window.sessionStorage.getItem('evolv:candidateToken'), '111_111_aa11bb22');
			});

			describe('when url includes another parameter in its hash before "evolvCandidateToken"', () => {
				it('should replace only "evolvCandidateToken" when reloading', () => {
					// Arrange
					window.location.hash = 'anotherParam=123&evolvCandidateToken=111_111_aa11bb22';

					// Act
					qaMode.activate();

					// Assert
					assert.equal(window.location, 'https://mydomain.com/#anotherParam=123');
				});
			});
		});
	});
});
