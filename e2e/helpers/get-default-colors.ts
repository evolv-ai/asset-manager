/// <reference path="../../node_modules/testcafe/ts-defs/index.d.ts" />

export function getDefaultColors(browser: Browser) {
	if (browser.alias === 'firefox') {
		return {
			button: 'rgb(0, 0, 0)',
			buttonBackground: 'rgb(240, 240, 240)'
		};
	} else if (browser.alias === 'ie') {
		return {
			button: 'rgb(33, 33, 33)',
			buttonBackground: 'rgb(239, 239, 239)'
		};
	} else {
		return {
			button: 'rgb(0, 0, 0)',
			buttonBackground: 'rgb(239, 239, 239)'
		};
	}
}
