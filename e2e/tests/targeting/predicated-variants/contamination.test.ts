/// <reference path="../../../types.d.ts" />

import { SinonSpy } from 'sinon';
import * as sinon from 'sinon';
import { RequestMock } from 'testcafe';

import { buildRequestHooks } from '../../../helpers';
import hooks from './contamination.hooks';


let spy: SinonSpy;

fixture `Predicated Variant Targeting > Contaminations`
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

test(`should fire contamination event after synchronous variant error`, async t => {
	// Preconditions
	await t.expect(spy.notCalled).ok();

	// Act
	await t.eval(function() {
		evolv.context.set('state', 'TX');
	});

	// Assert
    await t
	    .expect(spy.called).ok()
	    .expect(spy.lastCall.args[0].type).eql('contamination')
	    .expect(spy.lastCall.args[0].contaminationReason.details).eql('Don\'t mess with Texas');
});

test(`should fire contamination event after asynchronous variant rejection`, async t => {
	// Preconditions
	await t.expect(spy.notCalled).ok();

	// Act
	await t.eval(function() {
		evolv.context.set('state', 'CA');
	});

	// Assert
    await t
	    .expect(spy.called).ok()
	    .expect(spy.lastCall.args[0].type).eql('contamination')
	    .expect(spy.lastCall.args[0].contaminationReason.details).eql('Later dude');
});
