import babel from 'rollup-plugin-babel';
import localResolve from 'rollup-plugin-node-resolve';
import path from 'path';

const pkg = require(path.resolve('./package.json'));
const external = Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {}));
const name = pkg.name.split('/')[1];

export default {
  input: 'src/index.ts',
  output: [
    {
      file: `dist/es/${name}.js`,
      format: 'es',
      exports: 'named',
    },
    {
      file: `dist/cjs/${name}.js`,
      format: 'cjs',
      exports: 'named',
    },
  ],
  plugins: [
    localResolve({
      extensions: [ '.js', '.ts', '.tsx' ],
    }),
    babel({
      exclude: 'node_modules/**',
      extensions: [ '.js', '.ts', '.tsx' ],
    }),
  ],
  external,
};