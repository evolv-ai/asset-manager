/// <reference path="../../types.d.ts" />

import * as sinon from 'sinon';
import { SinonSpy } from 'sinon';
import { RequestMock } from 'testcafe';
import { buildRequestHooks, getDefaultColors } from '../../helpers';

import hooks from './variable.hooks';
import { Page } from './page.po';


let spy: SinonSpy;

fixture `Variable Targeting`
    .page `http://localhost:9090/tests/targeting/index.html`
	.meta({ spies: true })
	.beforeEach(async () => {
		spy = sinon.spy();
	})
    .requestHooks([
	    ...buildRequestHooks(hooks),
	    RequestMock()
		    .onRequestTo(/\/v1\/.+\/events/)
		    .respond((req: any, res: any) => {
			    const body = JSON.parse(req.body.toString());
			    spy(body);
		    })
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
		.expect(spy.called).ok();
});
