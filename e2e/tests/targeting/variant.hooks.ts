import { RequestFixtures } from '../../helpers';
import { css, js } from '../../helpers/tags';


const hooks: RequestFixtures = {
	configuration: {
		_published: 1593017688.9582465,
		_client: {
			browser: 'chrome',
			device: 'desktop',
			location: 'US',
			platform: 'macos'
		},
		_experiments: [
			{
				web: {
					dcvu1glgo: {
						_is_entry_point: true,
						sr5zokh9h: {
							_is_entry_point: false,
							_values: true,
							_initializers: true
						},
						_predicate: {
							combinator: 'and',
							rules: [
								{
									field: 'web.url',
									operator: 'regex64_match',
									value: 'Ly4qL2k='
								}
							]
						}
					}
				},
				_predicate: {},
				id: '7c0fc0794a'
			}
		]
	},
	allocations: [
		{
			uid: '34732756_1593019090286',
			sid: '43504432_1593017665217',
			eid: '7c0fc0794a',
			cid: 'dc627ea98011:7c0fc0794a',
			genome: {
				web: {
					dcvu1glgo: {
						sr5zokh9h: {
							_predicated_variants_group_id: '1',
							_predicated_values: [
								{
									_predicate: {
										"combinator": "and",
										"rules": [
											{
												"field": "state",
												"operator": "equal",
												"value": "TX"
											},
											{
												field: 'city',
												operator: 'not_equal',
												value: 'Austin'
											}
										]
									},
									_predicate_assignment_id: 'red',
									_value: {
										id: 'tz6zoo8ys',
										type: 'compound',
										_metadata: {},
										script: '',
										styles: 'button { background-color: red; }'
									}
								},
								{
									_predicate: {
										"combinator": "and",
										"rules": [
											{
												"field": "state",
												"operator": "equal",
												"value": "CA"
											}
										]
									},
									_predicate_assignment_id: 'blue',
									_value: {
										id: 'tz6zoo8ys',
										type: 'compound',
										_metadata: {},
										script: '',
										styles: 'button { background-color: blue; }'
									}
								},
								{
									_predicate: {
										"combinator": "or",
										"rules": [
											{
												"field": "state",
												"operator": "equal",
												"value": "VT"
											},
											{
												"field": "region",
												"operator": "equal",
												"value": "Northwest"
											}
										]
									},
									_predicate_assignment_id: 'green',
									_value: {
										id: 'tz6zoo8ys',
										type: 'compound',
										_metadata: {},
										script: '',
										styles: 'button { background-color: green; }'
									}
								},
								{
									_predicate: null,
									_predicate_assignment_id: 'default',
									_value: {
										id: 'tz6zoo8ys',
										type: 'compound',
										_metadata: {},
										script: '',
										styles: 'button { background-color: purple; }'
									}
								}
							]
						}
					}
				}
			},
			audience_query: {},
			excluded: false
		}
	],
	script: js`
		window.evolv = window.evolv || {};
		(function (evolv) {
			evolv.javascript = evolv.javascript || {};
			evolv.javascript.variants = evolv.javascript.variants || {};

			evolv.javascript.variants['evolv_web_dcvu1glgo_sr5zokh9h_red'] = function (resolve, reject) {
				document.querySelector('h1').innerText = 'Red';
			};

			evolv.javascript.variants['evolv_web_dcvu1glgo_sr5zokh9h_blue'] = function (resolve, reject) {
				document.querySelector('h1').innerText = 'Blue';
			};

			evolv.javascript.variants['evolv_web_dcvu1glgo_sr5zokh9h_green'] = function (resolve, reject) {
				document.querySelector('h1').innerText = 'Green';
			};

			evolv.javascript.variants['evolv_web_dcvu1glgo_sr5zokh9h_default'] = function (resolve, reject) {
				document.querySelector('h1').innerText = 'Purple';
			};
		})(window.evolv);
	`,
	style: css`
		html.evolv_web_dcvu1glgo_sr5zokh9h_red button {
			color: rgb(255, 0, 0)
		}
		html.evolv_web_dcvu1glgo_sr5zokh9h_blue button {
			color: rgb(0, 0, 255)
		}
		html.evolv_web_dcvu1glgo_sr5zokh9h_green button {
			color: rgb(0, 255, 0)
		}
		html.evolv_web_dcvu1glgo_sr5zokh9h_default button {
			color: rgb(255, 0, 255)
		}
	`
}

export default hooks;
