import { buildRequestHooks, skipIfIE, waitUntilLoaded } from '../../helpers';
import hooks from './immediate.hooks';


fixture `Timing: Immediate`
	.page `http://localhost:9090/tests/timing/immediate.html`
	.requestHooks(
		buildRequestHooks(hooks)
	);

test(`should apply variants immediately`, skipIfIE(async t => {
	await waitUntilLoaded();

	const { log } = await t.getBrowserConsoleMessages();
	const contextAppliedIndex = log.findIndex(entry => /^Context applied/.test(entry));
	const variantAppliedIndex = log.findIndex(entry => /^Variant applied/.test(entry));

	await t
		.expect(contextAppliedIndex).gte(0)
		.expect(variantAppliedIndex).gte(0)
		.expect(variantAppliedIndex).gt(contextAppliedIndex);
}));
