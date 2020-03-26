import resolve from '@rollup/plugin-node-resolve'
import commonJs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'bundle.js',
		format: 'iife',
		name: 'EvolvAssetManager'
  },
  plugins: [ resolve(), commonJs() ]
};
