
export const browsersForLocal = [
	'chrome',
	// 'firefox',
	// 'opera',
	// 'safari'
];

export const browsersForCI = [
	'chrome:headless',
	'firefox:headless'
];

export const browsersForBrowserStack = [
  // 'browserstack:chrome',

  // FIXME: Running more than 2 browsers fails
  'browserstack:edge',
  'browserstack:firefox',
  // 'browserstack:opera',
  // 'browserstack:safari',

  'browserstack:ie'
];
