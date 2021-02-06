/// <reference path="../../../types.d.ts" />

import { RequestLogger } from 'testcafe';

import { buildRequestHooks } from '../../../helpers';
import hooks from './confirmation.hooks';


const logger = RequestLogger(/\/v1\/.+\/events/, {
	logRequestBody: true,
	stringifyRequestBody: true
});

fixture `Predicated Variant Targeting > Confirmations`
    .page `http://localhost:9090/tests/targeting/index.html`
    .requestHooks([
	    ...buildRequestHooks(hooks),
	    logger
    ]);

test(`should fire confirmation event`, async t => {
	// Act
	await t.eval(function() {
		evolv.context.set('state', 'TX');
	});

	// Assert
	await t
		.expect(logger.count(() => true))
		.gte(1)
		.expect(logger.contains(result => {
			const data = JSON.parse(result.request.body);
			return data.type === 'confirmation';
		}))
		.ok();
});
