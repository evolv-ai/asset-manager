import TestController from 'testcafe';

type TestCallback = (t: TestController) => Promise<any>;

export function skipIfIE(fn: TestCallback): (t: TestController) => Promise<any> {
	return t => {
		if (t.browser.name.startsWith('Internet Explorer')) {
			console.log('\x1b[90m%s\x1b[0m', ' ◽️ [IE] Skipping tests because it is flaky in Internet Explorer');
			return t.expect(true).ok();
		}

		return fn(t);
	}
}
