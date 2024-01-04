import { RequestMock } from 'testcafe';


export interface RequestFixtures {
	configuration: object;
	allocations: object;
	script: string;
	style: string;
}

export function buildRequestHooks(fixtures: RequestFixtures) {
	const headers = {
		'access-control-allow-credentials': 'true',
		'access-control-allow-origin': '*'
	};

	return [
		RequestMock()
			.onRequestTo(/participants\.evolv\.ai\/v1\/.*\/.*\/assets.js/)
			.respond(fixtures.script, 200, {
				...headers,
				'content-type': 'text/javascript'
			}),
		RequestMock()
			.onRequestTo(/participants\.evolv\.ai\/v1\/.*\/.*\/assets.css/)
			.respond(fixtures.style, 200, {
				...headers,
				'content-type': 'text/css; charset=utf-8'
			}),
		RequestMock()
			.onRequestTo(/participants\.evolv\.ai\/v1\/.*\/.*\/configuration.json/)
			.respond(fixtures.configuration, 200, {
				...headers,
				'content-type': 'application/json'
			}),
		RequestMock()
			.onRequestTo(/participants\.evolv\.ai\/v1\/.*\/allocations/)
			.respond(fixtures.allocations, 200, {
				...headers,
				'content-type': 'application/json'
			}),
		RequestMock()
			.onRequestTo(/participants\.evolv\.ai\/v1\/.*\/data/)
			.respond('', 200, {
				...headers,
				'content-type': 'text/plain;charset=UTF-8'
			}),
		RequestMock()
			.onRequestTo(/participants\.evolv\.ai\/v1\/.*\/events/)
			.respond('', 200, {
				...headers,
				'content-type': 'text/plain;charset=UTF-8'
			})
	]
}
