import browsersync from 'browser-sync';
import { promisify } from 'util';


export function startWebServer(port) {
	port = port || 9090;
	const server = browsersync.create();
	const init = promisify(server.init);

	const options = {
		port: port,
		watch: false,
		ui: false,
		open: false,
		https: false,
		codeSync: false,
		notify: false,
		server: {
			baseDir: '.',
			routes: {
				'/': 'dist',
				'/lib/sinon.js': 'node_modules/sinon/pkg/sinon.js',
				'/tests': 'e2e/tests'
			}
		}
	};

	return init(options).then(() => server);
}
