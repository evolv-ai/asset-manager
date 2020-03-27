import resolve from '@rollup/plugin-node-resolve'
import commonJs from '@rollup/plugin-commonjs';

export default {
	input: 'src/webloader.js',
	output: {
		file: './dist/webloader.js',
		format: 'iife',
		name: 'webloader'
	},
	external: ['http', 'https'],
	plugins: [
		resolve({preferBuiltins: true}),
		commonJs()
	]
};
