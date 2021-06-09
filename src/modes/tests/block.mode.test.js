import * as assert from 'assert';

import blockMode, { BLOCK_RE, BLOCK_RE_REPLACE } from '../block.mode.js';

describe('blockMode', () => {
  describe('regex to find evolvBlockExecution', () =>{
    it('should match evolvBlockExecution set to true', () => {
      // Arrange
      const regex = new RegExp(BLOCK_RE);

      // Act
      const result = 'evolvBlockExecution=true'.match(regex);

      // Assert
      assert.ok(result)
      assert.equal(result[0], 'evolvBlockExecution=true')
      assert.equal(result[1], 'true')
    });

    it('should match evolvBlockExecution set to false', () => {
      // Arrange
      const regex = new RegExp(BLOCK_RE);

      // Act
      const result = 'evolvBlockExecution=false'.match(regex);

      // Assert
      assert.ok(result)
      assert.equal(result[0], 'evolvBlockExecution=false')
      assert.equal(result[1], 'false')
    });

    it('should not match incorrect evolvBlockExecution', () => {
      // Arrange
      const regex = new RegExp(BLOCK_RE);

      // Act
      const result = 'evolvBlockExecution=incorrect'.match(regex);

      // Assert
      assert.equal(result, null)
    });
  });
});

describe('regex to remove evolvBlockExecution', () => {
  it('should remove evolvBlockExecution from query params', () => {
    // Arrange
    const regex = new RegExp(BLOCK_RE_REPLACE);

    // Act
    const result1 = 'https://mydomain.com?evolvBlockExecution=true'.replace(regex, '');
    const result2 = 'https://mydomain.com?something=true&evolvBlockExecution=true'.replace(regex, '');

    // Assert
    assert.equal(result1, 'https://mydomain.com');
    assert.equal(result2, 'https://mydomain.com?something=true');
  });

  it('should remove evolvBlockExecution from hash', () => {
    // Arrange
    const regex = new RegExp(BLOCK_RE_REPLACE);

    // Act
    const result1 = 'https://mydomain.com#evolvBlockExecution=true'.replace(regex, '');
    const result2 = 'https://mydomain.com#something=true&evolvBlockExecution=true'.replace(regex, '');

    // Assert
    assert.equal(result1, 'https://mydomain.com');
    assert.equal(result2, 'https://mydomain.com#something=true');
  });
});

describe('shouldActivate()', () => {
	let origWindow;
	beforeEach(function(){
		origWindow = global.window;
	});

	afterEach(function(){
		global.window = origWindow;
	});

	it('should return true if evolvBlockExecution set in hash', () => {
    // Arrange
		global.window = {
			location: {
				href: 'https://mydomain.com',
				hash: '#evolvBlockExecution=true',
        search: ''
			}
		};

    // Act
		const result = blockMode.shouldActivate();

    // Assert
		assert.ok(result);
	});

	it('should return true if evolvBlockExecution set in query params', () => {
    // Arrange
		global.window = {
			location: {
				href: 'https://mydomain.com',
        hash: '',
				search: '?evolvBlockExecution=true'
			}
		};

    // Act
		const result = blockMode.shouldActivate();

    // Assert
		assert.ok(result);
	});

	it('should return false if evolvBlockExecution is missing in hash and query params', () => {
    // Arrange
		global.window = {
			location: {
				href: 'https://mydomain.com',
        search: '?something=true',
				hash: '#something=true'
			}
		};

    // Act
		const result = blockMode.shouldActivate();

    // Assert
		assert.equal(result, false);
	})
})
