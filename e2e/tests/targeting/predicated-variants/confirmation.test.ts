/// <reference path="../../../types.d.ts" />

import { SinonSpy } from 'sinon';
import * as sinon from 'sinon';
import { RequestMock } from 'testcafe';

import { buildRequestHooks } from '../../../helpers';
import hooks from './confirmation.hooks';


let spy: SinonSpy;

fixture `Predicated Variant Targeting > Confirmations`
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

test(`should fire confirmation event`, async t => {
	// Preconditions
	await t.expect(spy.notCalled).ok();

	// Act
	await t.eval(function() {
		evolv.context.set('state', 'TX');
	});

	// Assert
    await t
	    .expect(spy.called).ok()
	    .expect(spy.lastCall.args[0].type).eql('confirmation');
});
