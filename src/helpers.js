
const Helpers = /** @class */ (function() {

	function Helpers() {
		this.disposers = [];
	}

	/**
	 * @param {string[]} selectors
	 * @param {function(*?):void} callback
	 */
	Helpers.prototype.waitFor = function(selectors, callback) {
		this.dispose();

		const predicate = function() {
			return selectors.every(function(selector) {
				return document.querySelector(selector) !== null;
			});
		};

		let timer;

		function run() {
			cancelAnimationFrame(timer);

			try {
				if (predicate()) {
					callback(null);
				} else {
					timer = requestAnimationFrame(run);
				}
			} catch (err) {
				callback(err);
			}
		}

		run();

		return this.addDisposer(function() {
			cancelAnimationFrame(timer);
		});
	};

	Helpers.prototype.addDisposer = function(disposer) {
		this.disposers.push(disposer);
		return disposer;
	}

	Helpers.prototype.dispose = function() {
		this.disposers.forEach(function(disposer) {
			typeof disposer === 'function' && disposer();
		});

		this.disposers = [];
	};

	return Helpers;
})();

export { Helpers };
