import { bootstrap } from '@evolv/mutate';
import { initialize } from './webloader.js';

initialize(function() {
	bootstrap({ source: 'asset-manager' });
});
