import { buildRequestHooks, skipIfIE, waitUntilLoaded } from '../../helpers';
import hooks from './legacy.hooks';


fixture `Timing: Legacy`
	.page `http://localhost:9090/tests/timing/legacy.html`
	.requestHooks(
		buildRequestHooks(hooks)
	);

// Test is too flaky
test(`should apply variants respecting the legacy behavior`, skipIfIE(async t => {
	await waitUntilLoaded();

	const { log } = await t.getBrowserConsoleMessages();
	const domContentLoadedIndex = log.findIndex(entry => /^DOMContentLoaded/.test(entry));
	const contextAppliedIndex = log.findIndex(entry => /^Context applied/.test(entry));
	const variantAppliedIndex = log.findIndex(entry => /^Variant applied/.test(entry));

	await t
		.expect(domContentLoadedIndex).gte(0)
		.expect(contextAppliedIndex).gte(0)
		.expect(variantAppliedIndex).gte(0)
		.expect(variantAppliedIndex).gt(contextAppliedIndex)
		.expect(variantAppliedIndex).gt(domContentLoadedIndex);
}));
