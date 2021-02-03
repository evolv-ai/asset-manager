import { buildRequestHooks, getActiveKeys, getActiveVariants } from '../../helpers';
import hooks from './apply-changes.hooks';
import { Page } from './page.po';


fixture `Apply changes`
    .page `http://localhost:9090/tests/apply-changes/index.html`
    .requestHooks(
    	buildRequestHooks(hooks)
    );

const page = new Page();

test(`should apply mutations`, async t => {
	// Assert
	const activeKeys1 = await getActiveKeys();
	const activeVariants1 = await getActiveVariants();

    await t
        .expect(page.button.getStyleProperty('color'))
        .eql('rgb(0, 255, 0)')
	    .expect(page.header.innerText)
	    .eql('web.wki40gf5c.qzhnnwxj2')
	    .expect(activeKeys1.current).eql([
		    'web.wki40gf5c.qzhnnwxj2'
	    ])
	    .expect(activeVariants1).eql([
		    'web.wki40gf5c.qzhnnwxj2:-179034463'
	    ]);
});
