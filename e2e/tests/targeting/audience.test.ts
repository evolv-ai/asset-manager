/// <reference path="../../types.d.ts" />

import { buildRequestHooks, getDefaultColors } from '../../helpers';

import hooks from './audience.hooks';
import { Page } from './page.po';


fixture `Audience Targeting`
    .page `http://localhost:9090/tests/targeting/index.html?cachebust=1`
    .requestHooks(
	    buildRequestHooks(hooks)
    );

const page = new Page();

test(`should apply mutation only after context matches`, async t => {
	// Preconditions
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql(getDefaultColors(t.browser).button)
		.expect(page.header.innerText)
		.eql('Evolv');

	t.browser

	// Act
	await t.eval(function() {
		evolv.context.set('audience', 'adults');
	});

	// Assert
    await t
	    .expect(page.button.getStyleProperty('color'))
	    .eql('rgb(0, 255, 0)')
	    .expect(page.header.innerText)
	    .eql('Hello world');
});
