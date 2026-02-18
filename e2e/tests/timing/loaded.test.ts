import { buildRequestHooks, skipIfIE, waitUntilLoaded } from '../../helpers';
import hooks from './loaded.hooks';


fixture `Timing: Loaded`
	.page `http://localhost:9090/tests/timing/loaded.html`
	.requestHooks(
		buildRequestHooks(hooks)
	);

test(`should apply variants after the window.load event has fired`, skipIfIE(async t => {
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
