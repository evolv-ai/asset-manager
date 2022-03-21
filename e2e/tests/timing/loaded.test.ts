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

	await t
		.expect(log.length).eql(5)
		.expect(log[0]).match(/^Delay/)
		.expect(log[1]).match(/^DOMContentLoaded/)
		.expect(log[2]).match(/^Context applied/)
		.expect(log[3]).match(/^load/)
		.expect(log[4]).match(/^Variant applied/)
}));
