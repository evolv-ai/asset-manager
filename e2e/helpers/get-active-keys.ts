import { ClientFunction } from 'testcafe';


export const getActiveKeys =
	ClientFunction(() =>
		evolv.client.getActiveKeys() as { current: string[]; previous: string[]; }
	);
