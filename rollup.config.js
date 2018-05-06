import filesize from 'rollup-plugin-filesize';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
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
    typescript(),
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
