import { buildRequestHooks } from '../../helpers';
import hooks from './loaded.hooks';


fixture `Timing: Loaded`
	.page `http://localhost:9090/tests/timing/loaded.html`
	.requestHooks(
		buildRequestHooks(hooks)
	);

test(`should apply variants after the window.load event has fired`, async t => {
	const { log } = await t.getBrowserConsoleMessages();

	await t.wait(200);

	await t
		.expect(log.length).eql(5)
		.expect(log[0]).match(/^Context applied/)
		.expect(log[1]).match(/^Delay/)
		.expect(log[2]).match(/^DOMContentLoaded/)
		.expect(log[3]).match(/^load/)
		.expect(log[4]).match(/^Variant applied/);
});
