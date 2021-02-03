import { ClientFunction, RequestMock } from 'testcafe';
import { Page } from './page.po';

const getWindowTopProp = ClientFunction(prop => window.top[prop]);

fixture `Basic Render`
    .page `http://localhost:9090/tests/basic/index.html`
    .requestHooks(
        [
            RequestMock()
                .onRequestTo(/participants\.evolv\.ai\/v1\/.*\/.*\/assets.js/)
                .respond('', 200, {
                    'content-type': 'application/js',
                    'access-control-allow-credentials': 'true',
                    'access-control-allow-origin': '*'
                }),
            RequestMock()
                .onRequestTo(/participants\.evolv\.ai\/v1\/.*\/.*\/assets.css/)
                .respond('', 200, {
                    'content-type': 'application/css',
                    'access-control-allow-credentials': 'true',
                    'access-control-allow-origin': '*'
                }),
            RequestMock()
                .onRequestTo(/participants\.evolv\.ai\/v1\/.*\/.*\/configuration.json/)
                .respond({
                        "_client": {},
                        "_experiments": [],
                        "_published": "1593017688.9582465"
                }, 200, {
                    'content-type': 'application/json',
                    'access-control-allow-credentials': 'true',
                    'access-control-allow-origin': '*'
                }),
            RequestMock()
                .onRequestTo(/participants\.evolv\.ai\/v1\/.*\/allocations/)
                .respond([], 200, {
                    'content-type': 'application/json',
                    'access-control-allow-credentials': 'true',
                    'access-control-allow-origin': '*'
                })
        ]
    );

const page = new Page();

test(`should not change the button color`, async t => {
    await t
        .expect(page.button.getStyleProperty('color'))
        .eql('rgb(0, 0, 0)', 'expected to find the button unchanged');
});

test(`should not change the header text`, async t => {
    await t
        .expect(page.header.innerText)
        .eql('Evolv', 'expected to find the header text updated');
});

test(`should be able to read the evolv object`, async t => {
    let evolv = getWindowTopProp('evolv')

    await t
        .expect(!!evolv)
        .eql(true, 'expected to find evolv object');
});
