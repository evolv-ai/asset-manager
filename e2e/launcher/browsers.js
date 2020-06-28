
export const browsersForLocal = [
	'chrome'/*,
	'firefox',
	'opera',
	'safari'*/
];

// TODO bvuilding on CI
export const browsersForTravis = [
	'chrome:headless',
	'firefox:headless'
];

export const browsersForBrowserStack = [
	'browserstack:chrome',

	// FIXME: Parallel tests behave badly
	// 'browserstack:edge',
	// 'browserstack:firefox',
	// 'browserstack:opera',
	// 'browserstack:safari',

	// FIXME: End-to-end tests fail for IE
	// 'browserstack:ie',
];
