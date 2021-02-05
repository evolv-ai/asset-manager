/// <reference path="../../types.d.ts" />

import { buildRequestHooks, getDefaultColors } from '../../helpers';

import hooks from './multiple.hooks';
import { Page } from './page.po';


fixture `Targeting at Multiple Levels`
    .page `http://localhost:9090/tests/targeting/index.html`
    .requestHooks(
    	buildRequestHooks(hooks)
    );

const page = new Page();

test(`should apply mutation only after context matches at each level when updated piecewise`, async t => {
	// Preconditions
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql(getDefaultColors(t.browser).button)
		.expect(page.header.innerText)
		.eql('Evolv');

	// Act
	await t.eval(function() {
		evolv.context.set('audience', 'adults');
	});

	await t
		.expect(page.button.getStyleProperty('color'))
		.eql(getDefaultColors(t.browser).button)
		.expect(page.header.innerText)
		.eql('Evolv');

	await t.eval(function() {
		evolv.context.set('variable', 'alpha');
	});

	await t
		.expect(page.button.getStyleProperty('color'))
		.eql(getDefaultColors(t.browser).button)
		.expect(page.header.innerText)
		.eql('Evolv');

	await t.eval(function() {
		evolv.context.set('state', 'CA');
	});

	// Assert
    await t
	    .expect(page.button.getStyleProperty('color'))
	    .eql('rgb(0, 0, 255)')
	    .expect(page.header.innerText)
	    .eql('Blue');
});


test(`should apply mutation only after context matches at each level when updated all together`, async t => {
	// Preconditions
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql(getDefaultColors(t.browser).button)
		.expect(page.header.innerText)
		.eql('Evolv');

	// Act
	await t.eval(function() {
		evolv.context.update({
			audience: 'adults',
			variable: 'alpha',
			state: 'CA'
		});
	});

	// Assert
    await t
	    .expect(page.button.getStyleProperty('color'))
	    .eql('rgb(0, 0, 255)')
	    .expect(page.header.innerText)
	    .eql('Blue');
});
