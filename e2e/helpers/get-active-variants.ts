import { ClientFunction } from 'testcafe';


export const getActiveVariants =
	ClientFunction(() =>
		evolv.context.remoteContext.variants.active as string[]
	);
