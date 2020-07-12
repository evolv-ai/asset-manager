export default function all(promises) {
    let count = promises.length;
    const results = [];
    let thenHandler = null;
    let catchHandler = null;
    let finallyHandler = null;
    let allResolved = false;
    let err = null;

    const markDone = function() {
        allResolved = true;

        if (!err) {
            thenHandler && thenHandler(results);
        }

        finallyHandler && finallyHandler();
    };

    const checkDone = function() {
        count--;
        if (count === 0) {
            markDone();
        }
    };

    // Handle in case of no promises
    if (count === 0) {
        markDone();
    }

    promises.forEach(function(p, i) {
        p.then(function(x) {
            results[i] = x;
        }).catch(function(_err) {
            if (!err) {
                err = _err;
                catchHandler && catchHandler(err);
            }
        }).then(checkDone)
    });
    promises.forEach(function() {
        if (allResolved) {
            thenHandler && thenHandler(results);
            finallyHandler && finallyHandler();
        }
    });
    return {
        then: function (fn) {
            if (allResolved) {
                fn(results)
            }
            thenHandler = fn;
            return this; // Note - we can can only do 'then' once by returning 'this'
        },
        catch: function(fn) {
            if (err) {
                fn(err);
            }
            catchHandler = fn;
            return this;
        },
        finally: function(fn) {
            if (allResolved) {
                fn(results)
            }
            finallyHandler = fn;
            return this;
        }
    };
}
