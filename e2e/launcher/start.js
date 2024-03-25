import { startWebServer } from './start-web-server.js';
import { runTests } from './run-tests.js';
import program from 'commander';


program
	.version('1.0.0')
	.option('--mode <mode>', 'Run tests locally or on Actions', 'local')
	.option('--debug <debug>', 'Run in debug mode', false)
	.action(main)
	.parse(process.argv);

async function main() {
	let server = null;
	let runner = null;
	let failedTests = 0;

	try {
		server = await startWebServer();
		runner = await runTests(this.mode, this.debug);

		failedTests = await runner.results;
	} finally {
		if (runner && runner.instance) {
			runner.instance.close();
		}

		if (server) {
			await server.exit();
		}

		if (failedTests > 0) {
			process.exit(1);
		}
	}
}
