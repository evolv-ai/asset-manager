import { browsersForBrowserStack, browsersForLocal, browsersForTravis } from './browsers.js';
import testcafe from "testcafe";


export const Mode = {
	BrowserStack: 'browserstack',
	Local: 'local',
	Travis: 'travis'
};

export async function runTests(mode, debug) {
	const instance = await testcafe();

	if (!instance) {
		throw new Error('Testcafe failed to start');
	}

	let browsers = (mode === Mode.BrowserStack)
		? browsersForBrowserStack
		: (mode === Mode.Travis)
			? browsersForTravis
			: browsersForLocal;


	const results = instance
		.createRunner()
		// .filter(((testName, fixtureName, fixturePath, testMeta, fixtureMeta) => {
			/* FIXME: Tests that use spies to observe resource requests for a page
			 * are prone to non-deterministic failures. Therefore those are filtered
			 * out from the full test until a better approach is devised. */

			// @ts-ignore
		// 	return fixtureMeta.spies !== true && testMeta.spies !== true;
		// }))
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
