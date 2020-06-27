import all from '../all.js';
import * as assert from "assert";

describe('all should act like Promise.all', () => {
    describe('with an empty array', () => {
        it('should call then without finally or catch defined', (done) => {
            const promises = [];
            all(promises).then(function(values) {
                assert.strictEqual(values.length, 0);
                done();
            });
        });

        it('should not call catch', (done) => {
            const promises = [];
            all(promises).then(function(values) {
                assert.strictEqual(values.length, 0);
                done();
            }).catch(function() {
                assert.strictEqual(false, true); // unexpected path
                done();
            });
        });

        it('should call finally', (done) => {
            const promises = [];
            let thenCalled = false;
            all(promises).then(function() {
                thenCalled = true;
            }).finally(function() {
                assert.strictEqual(thenCalled, true);
                done();
            });
        });

        it('should call then + finally and not catch when defined', (done) => {
            const promises = [];
            let thenCalled = false;
            all(promises).then(function() {
                thenCalled = true;
            }).catch(function() {
                assert.strictEqual(false, true); // unexpected path
                done();
            }).finally(function() {
                assert.strictEqual(thenCalled, true); // expected path
                done();
            });
        });
    });

    describe('with an single promise', () => {
        describe('that resolves successfully, after the "all" registered', () => {
            it('should call then without finally or catch defined', (done) => {
                let successPromise1 = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve('success');
                    }, 10);
                });
                const promises = [successPromise1];

                all(promises).then(function(values) {
                    assert.deepStrictEqual(values, ['success']); // expected path
                    done();
                });
            });

            it('should not call catch', (done) => {
                let successPromise1 = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve('success');
                    }, 10);
                });
                const promises = [successPromise1];

                all(promises).then(function(values) {
                    assert.deepStrictEqual(values, ['success']); // expected path
                    done();
                }).catch(function() {
                    assert.deepStrictEqual(false, true); // unexpected path
                    done();
                });
            });

            it('should call finally', (done) => {
                let thenCalled = false;
                let successPromise1 = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve('success');
                    }, 10);
                });
                const promises = [successPromise1];

                all(promises).then(function(values) {
                    thenCalled = true;
                }).finally(function() {
                    assert.deepStrictEqual(thenCalled, true);
                    done();
                });
            });

            it('should call then + finally and not catch when defined', (done) => {
                let thenCalled = false;
                let successPromise1 = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve('success');
                    }, 10);
                });
                const promises = [successPromise1];

                all(promises).then(function() {
                    thenCalled = true;
                }).catch(function() {
                    assert.strictEqual(false, true); // unexpected path
                    done();
                }).finally(function() {
                    assert.strictEqual(thenCalled, true); // expected path
                    done();
                });
            });
        });

        describe('that resolves prior to the "all" registering', () => {
            it('should call then + finally and not catch when defined', (done) => {
                let thenCalled = false;
                let successPromise1 = Promise.resolve('success');

                const promises = [successPromise1];

                all(promises).then(function(values) {
                    assert.strictEqual(values.length, 1);
                    assert.strictEqual(values[0], 'success');
                    thenCalled = true;
                }).catch(function() {
                    assert.strictEqual(false, true); // unexpected path
                    done();
                }).finally(function() {
                    assert.strictEqual(thenCalled, true);
                    done();
                });
            });
        });

        describe('that errors', () => {
            it('should the catch with the error', (done) => {
                let successPromise1 = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject('fail');
                    }, 10);
                });
                const promises = [successPromise1];

                all(promises).then(function() {
                    assert.strictEqual(true, false); // unexpected path
                }).catch(function(err) {
                    assert.strictEqual(err, 'fail');
                    done();
                });
            });

            it('should the catch with the error and call finally', (done) => {
                let failCalled = false;
                let successPromise1 = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject('fail');
                    }, 10);
                });
                const promises = [successPromise1];

                all(promises).then(function() {
                    assert.strictEqual(true, false); // unexpected path
                }).catch(function(err) {
                    assert.strictEqual(err, 'fail');
                    failCalled = true;
                }).finally(function() {
                    assert.strictEqual(failCalled, true); // expected path
                    done();
                });
            });
        });

        describe('that rejects prior to the "all" registering', () => {
            it('should call catch + finally and not catch when defined', (done) => {
                let catchCalled = 0;
                let successPromise1 = Promise.reject('fail');

                const promises = [successPromise1];

                all(promises).then(function(values) {
                    assert.strictEqual(false, true); // unexpected path
                    done();
                }).catch(function(err) {
                    assert.strictEqual(err, 'fail');
                    catchCalled++;
                }).finally(function() {
                    assert.strictEqual(catchCalled, 1);
                    done();
                });
            });
        });
    });

    describe('with an 2 promises', () => {
        describe('that both resolve successfully',() => {
            it('should call then and finally with correct params',(done) => {
                let thenCalled = 0;
                let successPromise1 = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve('success1');
                    }, 10);
                });

                let successPromise2 = Promise.resolve('success2');

                const promises = [successPromise1, successPromise2];

                all(promises).then(function(values) {
                    thenCalled++;
                    assert.strictEqual(values.length, 2);
                    assert.strictEqual(values[0], 'success1');
                    assert.strictEqual(values[1], 'success2');
                }).catch(function(err) {
                    assert.strictEqual(false, true); // unexpected path
                    done();
                }).finally(function() {
                    assert.strictEqual(thenCalled, 1);
                    done();
                });
            });
        });

        describe('that both error',() => {
            it('should call catch with the first error and then finally',(done) => {
                let catchCalled = 0;

                let failPromise1 = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject('fail1');
                    }, 10);
                });

                let failPromise2 = Promise.reject('fail2');
                const promises = [failPromise1, failPromise2];

                all(promises).then(function(values) {
                    assert.strictEqual(false, true); // unexpected path
                    done();

                }).catch(function(err) {
                    catchCalled++;
                    assert.strictEqual(err, 'fail2');
                }).finally(function() {
                    assert.strictEqual(catchCalled, 1);
                    done();
                });
            });
        });

        describe('on error, one success',(done) => {
            it('should call catch with the erroring promise and then finally', (done) => {
                let catchCalled = 0;

                let failPromise1 = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject('fail1');
                    }, 10);
                });

                let successPromise1 = Promise.resolve('success1');
                const promises = [failPromise1, successPromise1];

                all(promises).then(function (values) {
                    assert.strictEqual(false, true); // unexpected path
                    done();
                }).catch(function (err) {
                    catchCalled++;
                    assert.strictEqual(err, 'fail1');
                }).finally(function () {
                    assert.strictEqual(catchCalled, 1);
                    done();
                });
            });
        });
    });

    describe('with an 3 promises', () => {
        describe('with one error',() => {
            it('should call catch with the erroring promise and then finally', (done) => {
                let catchCalled = 0;

                let failPromise1 = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject('fail1');
                    }, 10);
                });

                let successPromise1 = Promise.resolve('success1');
                let successPromise2 = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve('success2');
                    }, 10);
                });
                const promises = [failPromise1, successPromise1, successPromise2];

                all(promises).then(function (values) {
                    assert.strictEqual(false, true); // unexpected path
                    done();
                }).catch(function (err) {
                    catchCalled++;
                    assert.strictEqual(err, 'fail1');
                }).finally(function () {
                    assert.strictEqual(catchCalled, 1);
                    done();
                });
            });
        });

        describe('with two error',() => {
            it('should call catch with the erroring promise and then finally', (done) => {
                let catchCalled = 0;

                let failPromise1 = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject('fail1');
                    }, 10);
                });

                let failPromise2 = Promise.reject('fail2');
                let successPromise2 = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve('success2');
                    }, 10);
                });
                const promises = [failPromise1, failPromise2, successPromise2];

                all(promises).then(function (values) {
                    assert.strictEqual(false, true); // unexpected path
                    done();
                }).catch(function (err) {
                    catchCalled++;
                    assert.strictEqual(err, 'fail2');
                }).finally(function () {
                    assert.strictEqual(catchCalled, 1);
                    done();
                });
            });
        });
    });
});
