import vue from 'rollup-plugin-vue'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import postcss from 'rollup-plugin-postcss'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const input = path.resolve(__dirname, '../packages/v2plus/index.js')

const plugins = [
  resolve({
    extensions: ['.js', '.vue', '.json'],
  }),
  commonjs(),
  vue({
    css: false,
    template: {
      isProduction: true,
      compilerOptions: { preserveWhitespace: false },
    },
  }),
  postcss({
    extract: path.resolve(__dirname, '../dist/v2plus.css'),
    minimize: true,
    use: [['sass', { includePaths: [path.resolve(__dirname, '../packages/theme-chalk/src')] }]],
    extensions: ['.css', '.scss'],
    plugins: [],
  }),
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
    presets: [
      ['@babel/preset-env', { modules: false, targets: { browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'] } }],
    ],
  }),
  terser({
    format: { comments: false },
  }),
]

const external = ['vue']

export default [
  {
    input,
    output: {
      file: path.resolve(__dirname, '../dist/v2plus.esm.js'),
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins,
  },
  {
    input,
    output: {
      file: path.resolve(__dirname, '../dist/v2plus.umd.js'),
      format: 'umd',
      name: 'V2Plus',
      exports: 'named',
      globals: { vue: 'Vue' },
      sourcemap: true,
    },
    external,
    plugins,
  },
]
