import { buildRequestHooks, skipIfIE, waitUntilLoaded } from '../../helpers';
import hooks from './legacy.hooks';


fixture `Timing: Legacy`
	.page `http://localhost:9090/tests/timing/legacy.html`
	.requestHooks(
		buildRequestHooks(hooks)
	);

// Test is too flaky
test.skip(`should apply variants respecting the legacy behavior`, skipIfIE(async t => {
	await waitUntilLoaded();

	const { log } = await t.getBrowserConsoleMessages();

	await t
		.expect(log.length).eql(5)
		.expect(log[0]).match(/^Context applied/)
		.expect(log[1]).match(/^Variant applied/)
		.expect(log[2]).match(/^Delay/)
		.expect(log[3]).match(/^DOMContentLoaded/)
		.expect(log[4]).match(/^load/);
}));
