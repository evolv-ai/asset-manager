import { buildRequestHooks, skipIfIE, waitUntilLoaded } from '../../helpers';
import hooks from './immediate.hooks';


fixture `Timing: Immediate`
	.page `http://localhost:9090/tests/timing/immediate.html`
	.requestHooks(
		buildRequestHooks(hooks)
	);

test(`should apply variants immediately`, skipIfIE(async t => {
	console.log('\x1b[90m%s\x1b[0m', ' ◽️ [IE] Skipping tests because test is flaky in Internet Explorer');
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
