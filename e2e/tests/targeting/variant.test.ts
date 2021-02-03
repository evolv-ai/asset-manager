/// <reference path="../../types.d.ts" />

import { getActiveKeys, getActiveVariants } from '../../helpers';
import { buildRequestHooks } from '../../helpers';

import hooks from './variant.hooks';
import { Page } from './page.po';


fixture `Predicated Variant Targeting`
    .page `http://localhost:9090/tests/targeting/index.html`
    .requestHooks(
    	buildRequestHooks(hooks)
    );

const page = new Page();

test(`should handle predicated variants`, async t => {
	// Preconditions
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql('rgb(0, 0, 0)')
		.expect(page.header.innerText)
		.eql('Evolv');

	// Act
	await t.eval(function() {
		evolv.context.set('state', 'TX');
		evolv.context.set('city', 'Dallas');
	});

	// Assert
	const activeKeys1 = await getActiveKeys();
	const activeVariants1 = await getActiveVariants();

    await t
	    .expect(page.button.getStyleProperty('color'))
	    .eql('rgb(255, 0, 0)')
	    .expect(page.header.innerText)
	    .eql('Red')
	    .expect(activeKeys1.current).eql([
	    	'web.dcvu1glgo.sr5zokh9h',
		    'web.dcvu1glgo.sr5zokh9h.red'
	    ])
	    .expect(activeVariants1).eql([
		    'web.dcvu1glgo.sr5zokh9h:-928793511'
	    ]);

	// Act
	await t.eval(function() {
		evolv.context.set('state', 'CA');
	});

	// Assert
	const activeKeys2 = await getActiveKeys();
	const activeVariants2 = await getActiveVariants();

    await t
	    .expect(page.button.getStyleProperty('color'))
	    .eql('rgb(0, 0, 255)')
	    .expect(page.header.innerText)
	    .eql('Blue')
	    .expect(activeKeys2.current).eql([
		    'web.dcvu1glgo.sr5zokh9h',
		    'web.dcvu1glgo.sr5zokh9h.blue'
	    ])
	    .expect(activeVariants2).eql([
		    'web.dcvu1glgo.sr5zokh9h:-1426189982'
	    ]);
});

test(`should apply default variant only after all touched keys have been defined`, async t => {
	// Preconditions
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql('rgb(0, 0, 0)')
		.expect(page.header.innerText)
		.eql('Evolv');

	// Act
	await t.eval(function() {
		evolv.context.set('state', 'CO');
		evolv.context.set('region', 'West');
	});

	// Assert
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql('rgb(255, 0, 255)')
		.expect(page.header.innerText)
		.eql('Purple');
});

test(`should not apply default variant until all touched keys have been defined (OR combinator)`, async t => {
	// Act
	await t.eval(function() {
		evolv.context.set('state', 'NH');
		evolv.context.set('city', 'Hartford');

		// One predicate uses "region" as part of an OR expression, so all keys will be touched
		//evolv.context.set('region', 'Northwest');
	});

	// Assert
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql('rgb(0, 0, 0)')
		.expect(page.header.innerText)
		.eql('Evolv');

	// Act
	await t.eval(function() {
		evolv.context.set('region', 'Northeast');
	});

	// Assert
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql('rgb(255, 0, 255)')
		.expect(page.header.innerText)
		.eql('Purple');
});

test(`should not apply default variant until all touched keys have been defined (AND combinator)`, async t => {
	// Act
	await t.eval(function() {
		evolv.context.set('state', 'NH');
		evolv.context.set('region', 'Northeast');

		// One predicate uses "city" as part of an AND expression, but when the first condition fails,
		// the second condition is not touched
	});

	// Assert
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql('rgb(255, 0, 255)')
		.expect(page.header.innerText)
		.eql('Purple');
});

test(`should not apply default variant if not all touched keys have been defined`, async t => {
	// Preconditions
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql('rgb(0, 0, 0)')
		.expect(page.header.innerText)
		.eql('Evolv');

	// Act
	await t.eval(function() {
		evolv.context.set('state', 'NH');
		evolv.context.set('city', 'Hartford');
	});

	// Assert
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql('rgb(0, 0, 0)')
		.expect(page.header.innerText)
		.eql('Evolv');

	// Act
	await t.eval(function() {
		evolv.context.set('state', 'NM');

		// The "region" key has not been defined
	});

	// Assert
	await t
		.expect(page.button.getStyleProperty('color'))
		.eql('rgb(0, 0, 0)')
		.expect(page.header.innerText)
		.eql('Evolv');
});
