import { ClientFunction } from 'testcafe';

export const waitUntilLoaded = ClientFunction(() => {
	return new Promise<void>(resolve => {
		if (document.readyState === 'complete') {
			resolve();
		}

		document.addEventListener('readystatechange', () => {
			if (document.readyState === 'complete') {
				resolve();
			}
		});
	});
});
