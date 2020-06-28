
export const browsersForLocal = [
	'chrome'/*,
	'firefox',
	'opera',
	'safari'*/
];

export const browsersForCI = [
	'chrome:headless',
	'firefox:headless'
];

export const browsersForBrowserStack = [
	'browserstack:chrome',

	// FIXME: Parallel tests behave badly
	// 'browserstack:edge',
	'browserstack:firefox',
	// 'browserstack:opera',
	// 'browserstack:safari',

	'browserstack:ie'
];
