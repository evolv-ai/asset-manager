import {Page} from "./page.po";
import { RequestMock} from 'testcafe';

fixture `Apply changes`
    .page `http://localhost:9000/tests/apply-changes/index.html`
    .requestHooks(
        [
            RequestMock()
                .onRequestTo(/participants\.evolv\.ai\/v1\/.*\/.*\/assets.js/)
                .respond(`window.evolv = window.evolv || {};
                    (function (evolv) {
                      evolv.javascript = evolv.javascript || {};
                      evolv.javascript.variants = evolv.javascript.variants || {};
                    
                      evolv.javascript.variants["evolv_web_wki40gf5c_qzhnnwxj2"] = function () {
                        return new Promise(function (resolve, reject) {
                          document.querySelector('h1').innerText='Evolved';
                          resolve();
                        });
                      };                                     
                    })(window.evolv);`, 200, {
                    'content-type': 'application/js',
                    'access-control-allow-credentials': true,
                    'access-control-allow-origin': '*'
                }),
            RequestMock()
                .onRequestTo(/participants\.evolv\.ai\/v1\/.*\/.*\/assets.css/)
                .respond('html.evolv_web_wki40gf5c_qzhnnwxj2 button{color:green}', 200, {
                    'content-type': 'application/css',
                    'access-control-allow-credentials': true,
                    'access-control-allow-origin': '*'
                }),
            RequestMock()
                .onRequestTo(/participants\.evolv\.ai\/v1\/.*\/.*\/configuration.json/)
                .respond({
                        "_published": 1593017688.9582465,
                        "_client": {
                            "browser": "chrome",
                            "device": "desktop",
                            "location": "US",
                            "platform": "macos"
                        },
                        "_experiments": [
                            {
                                "web": {
                                    "wki40gf5c": {
                                        "_is_entry_point": true,
                                        "_predicate": {
                                            "combinator": "and",
                                            "rules": [
                                                {
                                                    "field": "web.url",
                                                    "operator": "regex64_match",
                                                    "value": "Ly4qL2k="
                                                }
                                            ]
                                        }
                                    }
                                },
                                "_predicate": {},
                                "id": "7c0fc0794a"
                            }
                        ]
                    }
                    , 200, {
                    'content-type': 'application/json',
                    'access-control-allow-credentials': true,
                    'access-control-allow-origin': '*'
                }),
            RequestMock()
                .onRequestTo(/participants\.evolv\.ai\/v1\/.*\/allocations/)
                .respond([{
                    "uid":"34732756_1593019090286",
                    "sid":"43504432_1593017665217",
                    "eid":"7c0fc0794a",
                    "cid":"dc627ea98011:7c0fc0794a",
                    "genome":{
                        "web":{
                            "wki40gf5c":{
                                "qzhnnwxj2":{
                                    "id":"tz6zoo8ys",
                                    "type":"compound",
                                    "_metadata":{},
                                    "script":"",
                                    "styles":""
                                }
                            }
                        }
                    },
                    "audience_query":{},
                    "excluded":false
                }], 200, {
                    'content-type': 'application/json',
                    'access-control-allow-credentials': true,
                    'access-control-allow-origin': '*'
                })
        ]
    );

const page = new Page();

test(`should change the button color`, async t => {
    await t
        .expect(page.button.getStyleProperty('color'))
        .eql('rgb(0, 255, 0)', 'expected to find the button color updated');
});

// TODO - assets.css doesn't apply until resaved in chrome
/*
test(`should change the header text`, async t => {
    await t
        .expect(page.header.innerText)
        .eql('Evolved', 'expected to find the header text updated');
});*/
