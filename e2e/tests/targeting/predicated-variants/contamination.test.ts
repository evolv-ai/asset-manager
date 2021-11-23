/// <reference path="../../../types.d.ts" />

import { RequestLogger } from 'testcafe';

import { buildRequestHooks } from '../../../helpers';
import hooks from './contamination.hooks';


const logger = RequestLogger(/\/v1\/.+\/events/, {
	logRequestBody: true,
	stringifyRequestBody: true
});

fixture `Predicated Variant Targeting > Contaminations`
    .page `http://localhost:9090/tests/targeting/index.html`
    .requestHooks([
	    ...buildRequestHooks(hooks),
	    logger
    ]);

test(`should fire contamination event after synchronous variant error`, async t => {
	// Act
	await t.eval(function() {
		evolv.context.set('state', 'TX');
	});

	// Assert
    await t
		.expect(logger.count(() => true))
	    .gte(1)
		.expect(() => {
			let result = logger.requests[0];
			const data = JSON.parse(<string>result.request.body);
			return data.type === 'contamination'
				&& data.contaminationReason.details === 'Don\'t mess with Texas';
		})
	    .ok();
});

test(`should fire contamination event after asynchronous variant rejection`, async t => {
	// Act
	await t.eval(function() {
		evolv.context.set('state', 'CA');
	});

	// Assert
	await t
		.expect(logger.count(() => true))
		.gte(1)
		.expect(() => {
			let result = logger.requests[0];
			const data = JSON.parse(<string>result.request.body);
			return data.type === 'contamination'
				&& data.contaminationReason.details === 'Later dude';
		})
		.ok();
});
