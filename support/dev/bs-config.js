import browserSync from 'browser-sync';

const server = browserSync.create();

server.init({
	ui: {
		port: 9091
	},
	watchEvents: [
		'change'
	],
	watch: true,
	ignore: [],
	single: false,
	watchOptions: {
		ignoreInitial: true
	},
	server: {
		baseDir: '.',
		routes: {
			'/': 'dist',
			'/lib/sinon.js': 'node_modules/sinon/pkg/sinon.js',
			'/sites': 'support/dev/sites',
			'/tests': 'e2e/tests'
		}
	},
	proxy: false,
	port: 9090,
	serveStatic: [],
	logLevel: 'info',
	logPrefix: 'Browsersync',
	logConnections: false,
	logFileChanges: true,
	logSnippet: true,
	open: true,
	startPath: 'sites/basic',
	browser: 'default',
	cors: false,
	xip: false,
	hostnameSuffix: false,
	reloadOnRestart: false,
	notify: true,
	reloadDelay: 0,
	reloadDebounce: 5000,
	reloadThrottle: 0,
	plugins: [],
	injectChanges: true,
	minify: true,
	host: '0.0.0.0',
	https: false,
	localOnly: false,
	codeSync: true,
	timestamps: true,
	injectNotification: false
});
