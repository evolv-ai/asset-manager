import { buildRequestHooks, skipIfIE, waitUntilLoaded } from '../../helpers';
import hooks from './dom-content-loaded.hooks';


fixture `Timing: DOMContentLoaded`
	.page `http://localhost:9090/tests/timing/dom-content-loaded.html`
	.requestHooks(
		buildRequestHooks(hooks)
	);

test(`should apply variants after DOMContentLoaded has fired`, skipIfIE(async t => {
	await waitUntilLoaded();

	const { log } = await t.getBrowserConsoleMessages();

	await t
		.expect(log.length).eql(5)
		.expect(log[0]).match(/^Delay/)
		.expect(log[1]).match(/^DOMContentLoaded/)
		.expect(log[2]).match(/^load/)
		.expect(log[3]).match(/^Context applied/)
		.expect(log[4]).match(/^Variant applied/);
}));
