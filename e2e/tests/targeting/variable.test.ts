/// <reference path="../../types.d.ts" />

import { RequestLogger } from 'testcafe';
import { buildRequestHooks, getDefaultColors } from '../../helpers';

import hooks from './variable.hooks';
import { Page } from './page.po';


const logger = RequestLogger(/\/v1\/.+\/events/);

fixture `Variable Targeting`
    .page `http://localhost:9090/tests/targeting/index.html`
    .requestHooks([
	    ...buildRequestHooks(hooks),
	    logger
    ]);

const page = new Page();

test(`should apply mutation only after context matches`, async t => {
	// Preconditions
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql(getDefaultColors(t.browser).button)
		.expect(page.header.innerText)
		.eql('Evolv');

	// Act
	await t.eval(function() {
		evolv.context.set('variable', 'alpha');
	});

	// Assert
    await t
	    .expect(page.button.getStyleProperty('color'))
	    .eql('rgb(0, 255, 0)')
	    .expect(page.header.innerText)
	    .eql('Hello world')
		.expect(logger.count(() => true))
	    .gt(0);
});
