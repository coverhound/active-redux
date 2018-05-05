import filesize from 'rollup-plugin-filesize';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
    'axios/lib/core/createError',
  ],
  plugins: [
    babel({
      exclude: [
        'node_modules/**',
        '**/*.json',
      ],
    }),
    commonjs(),
    filesize(),
  ]
};
