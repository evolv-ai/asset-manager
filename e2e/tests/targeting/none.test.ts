import { buildRequestHooks } from '../../helpers';

import hooks from './none.hooks';
import { Page } from './page.po';


fixture `No Targeting`
    .page `http://localhost:9090/tests/targeting/index.html`
    .requestHooks(
    	buildRequestHooks(hooks)
    );

const page = new Page();

test(`should apply mutation immediately`, async t => {
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql('rgb(0, 255, 0)')
		.expect(page.header.innerText)
		.eql('Hello world');
});
