import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { babel } from '@rollup/plugin-babel'

import { module, main } from './package.json'

export default {
  input: './index.js',
  output: [
    { file: module, format: 'es', sourcemap: false },
    {
      file: main,
      format: 'umd',
      name: 'handyjs',
      sourcemap: false,
      globals: {
        axios: 'axios'
      }
    }
  ],
  plugins: [
    json(),
    nodeResolve(),
    commonjs(),
    babel({ babelHelpers: 'bundled' })
  ],
  external: ['axios']
}
