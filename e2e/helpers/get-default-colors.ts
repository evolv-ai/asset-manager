/// <reference path="../../node_modules/testcafe/ts-defs/index.d.ts" />

export function getDefaultColors(browser: Browser) {
	if (browser.name === 'Firefox') {
		return {
			button: 'rgb(0, 0, 0)',
			buttonBackground: 'rgb(240, 240, 240)'
		};
	} else if (browser.name === 'Internet Explorer') {
		return {
			button: 'rgb(33, 33, 33)',
			buttonBackground: 'rgb(240, 240, 240)'
		};
	} else {
		return {
			button: 'rgb(0, 0, 0)',
			buttonBackground: 'rgb(239, 239, 239)'
		};
	}
}
