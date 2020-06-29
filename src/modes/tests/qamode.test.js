import * as assert from 'assert';

import qaMode, { QA_RE } from '../qa.mode.js';

describe('qa mode reqex', () => {
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

describe('qa mode shouldActivate', () => {
	let origWindow;
	beforeEach(function(){
		origWindow = global.window;
	});

	afterEach(function(){
		global.window = origWindow;
	});

	it('should return true if environment id matches token', () => {
		global.window = {
			location: {
				href: 'https://mydomain.com',
				hash: 'evolvCandidateToken=111_111_aa11bb22'
			}
		};
		const environmentId = 'aa11bb22';

		const result = qaMode.shouldActivate(environmentId);

		assert.ok(result);
	});

	it('should return false if environment id does not match token', () => {
		global.window = {
			location: {
				href: 'https://mydomain.com',
				hash: 'evolvCandidateToken=111_111_aa11bb22'
			}
		};
		const environmentId = 'bb22cc33';

		const result = qaMode.shouldActivate(environmentId);

		assert.equal(result, false);
	})
})
