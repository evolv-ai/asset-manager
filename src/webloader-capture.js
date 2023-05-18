import { bootstrap as bootstrapMutate } from '@evolv/mutate';
import { bootstrap as bootstrapCapture } from '@sentienttechnologies/dom-capture';
import { initialize } from './webloader.js';

initialize(function(config) {
	bootstrapMutate({ source: 'asset-manager' });

	bootstrapCapture({
		capture: config.capture,
		endpoint: config.captureEndpoint,
		blockSelector: config.captureBlockSelector,
		captureUserInteractions: config.captureUserInterations
	});
});
