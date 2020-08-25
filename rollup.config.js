import resolve from '@rollup/plugin-node-resolve'
import commonJs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';

export default {
	input: 'src/webloader.js',
	output: [
		{
			file: './dist/webloader.js',
			format: 'iife',
			name: 'webloader',
			sourcemap: true
		},
		{
			file: './dist/webloader.min.js',
			format: 'iife',
			plugins: [terser()]
		}
	],
	plugins: [
		resolve({}),
		commonJs()
	]
};
