import { browsersForBrowserStack, browsersForLocal, browsersForCI } from './browsers.js';
import testcafe from "testcafe";


export const Mode = {
	BrowserStack: 'browserstack',
	Local: 'local',
	GithubActions: 'githubactions'
};

export async function runTests(mode, debug) {
	const instance = await testcafe();

	if (!instance) {
		throw new Error('Testcafe failed to start');
	}

	let browsers = (mode === Mode.BrowserStack)
		? browsersForBrowserStack
		: (mode === Mode.GithubActions)
			? browsersForCI
			: browsersForLocal;


	const results = instance
		.createRunner()
		.src('e2e/tests/**/*.test.ts')
		.browsers(browsers)
		.concurrency(1)
		.run({
			debugMode: debug
		});

	return {
		instance,
		results
	};
}
