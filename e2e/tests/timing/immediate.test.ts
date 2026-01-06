import { buildRequestHooks, skipIfIE, waitUntilLoaded } from '../../helpers';
import hooks from './immediate.hooks';


fixture `Timing: Immediate`
	.page `http://localhost:9090/tests/timing/immediate.html`
	.requestHooks(
		buildRequestHooks(hooks)
	);

test.skip(`should apply variants immediately`, skipIfIE(async t => {
	await waitUntilLoaded();

	const { log } = await t.getBrowserConsoleMessages();

	await t
		.expect(log.length).eql(4)
		.expect(log[0]).match(/^Delay/)
		.expect(log[1]).match(/^DOMContentLoaded/)
		.expect(log[2]).match(/^Context applied/)
		.expect(log[3]).match(/^Variant applied/);
}));
