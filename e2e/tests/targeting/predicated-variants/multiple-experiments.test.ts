/// <reference path="../../../types.d.ts" />

import { buildRequestHooks, getActiveKeys } from '../../../helpers';
import { Page } from '../page.po';
import hooks from './multiple-experiments.hooks';


fixture `Predicated Variant Targeting > Multiple Experiments`
    .page `http://localhost:9090/tests/targeting/index.html`
    .requestHooks(
    	buildRequestHooks(hooks)
    );

const page = new Page();

test(`should handle multiple experiments`, async t => {
	// Preconditions
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql('rgb(0, 0, 0)')
		.expect(page.header.innerText)
		.eql('Evolv')
		.expect(page.button.getStyleProperty('background-color'))
		.eql('rgb(239, 239, 239)')
		.expect(page.button.innerText)
		.eql('Click');

	// Act
	await t.eval(function() {
		evolv.context.set('state', 'TX');
		evolv.context.set('flavor', 'chocolate');
	});

	// Assert
	const activeKeys = await getActiveKeys();

	await t
		.expect(page.button.getStyleProperty('color'))
		.eql('rgb(0, 255, 0)')
		.expect(page.header.innerText)
		.eql('Green')
		.expect(page.button.getStyleProperty('background-color'))
		.eql('rgb(210, 105, 30)')
		.expect(page.button.innerText)
		.eql('Chocolate')
		.expect(activeKeys.current).eql([
			'web.dcvu1glgo.sr5zokh9h',
			'web.dcvu1glgo.sr5zokh9h.green',
			'web.y25ih3tpb.l0nurobfl',
			'web.y25ih3tpb.l0nurobfl.chocolate',
		]);
});
