import { RequestFixtures } from '../../../helpers';
import { css, js } from '../../../helpers/tags';


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
			},
			{
				web: {
					y25ih3tpb: {
						_is_entry_point: true,
						l0nurobfl: {
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
				id: '8b97792d68'
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
											}
										]
									},
									_assignment_id: 'green',
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
									_assignment_id: 'default',
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
		},
		{
			uid: '93736284_1611365976057',
			sid: '32402814_1611365976057',
			eid: '8b97792d68',
			cid: '36aee3aeaa87:8b97792d68',
			genome: {
				web: {
					y25ih3tpb: {
						l0nurobfl: {
							_predicated_variants_group_id: '2',
							_predicated_values: [
								{
									_predicate: {
										"combinator": "and",
										"rules": [
											{
												"field": "flavor",
												"operator": "equal",
												"value": "chocolate"
											}
										]
									},
									_assignment_id: 'chocolate',
									_value: {
										id: 'tz6zoo8ys',
										type: 'compound',
										_metadata: {},
										script: '',
										styles: ''
									}
								},
								{
									_predicate: {
										"combinator": "and",
										"rules": [
											{
												"field": "flavor",
												"operator": "equal",
												"value": "strawberry"
											}
										]
									},
									_assignment_id: 'strawberry',
									_value: {
										id: 'tz6zoo8ys',
										type: 'compound',
										_metadata: {},
										script: '',
										styles: ''
									}
								},
								{
									_predicate: null,
									_assignment_id: 'default',
									_value: {
										id: 'tz6zoo8ys',
										type: 'compound',
										_metadata: {},
										script: '',
										styles: ''
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

			evolv.javascript.variants['evolv_web_dcvu1glgo_sr5zokh9h_green'] = function (resolve, reject) {
				document.querySelector('h1').innerText = 'Green';
			};

			evolv.javascript.variants['evolv_web_y25ih3tpb_l0nurobfl_chocolate'] = function (resolve, reject) {
				document.querySelector('button').innerText = 'Chocolate';
			};

			evolv.javascript.variants['evolv_web_y25ih3tpb_l0nurobfl_strawberry'] = function (resolve, reject) {
				document.querySelector('button').innerText = 'Strawberry';
			};

			evolv.javascript.variants['evolv_web_y25ih3tpb_l0nurobfl_default'] = function (resolve, reject) {
				document.querySelector('button').innerText = 'Vanilla';
			};
		})(window.evolv);
	`,
	style: css`
		html.evolv_web_dcvu1glgo_sr5zokh9h_green button {
			color: rgb(0, 255, 0)
		}

		html.evolv_web_y25ih3tpb_l0nurobfl_chocolate button {
			background-color: rgb(210, 105, 30) /* chocolate */
		}

		html.evolv_web_y25ih3tpb_l0nurobfl_strawberry button {
			background-color: rgb(220, 20, 60); /* crimson */
		}

		html.evolv_web_y25ih3tpb_l0nurobfl_default button {
			background-color: rgb(245, 245, 220) /* beige */
		}
	`
}

export default hooks;
