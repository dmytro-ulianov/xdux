import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'

const input = 'src/index.js'
const name = '@drukas/xdux'
const external = ['invariant', 'ramda', 'redux-actions']

const getConfig = (file, format, minify = false) => {
  return {
    external,
    input,
    output: { exports: 'named', file, format, name },
    plugins: [babel(), minify && uglify()].filter(Boolean),
  }
}

export default [
  getConfig('dist/xdux.es.js', 'es'),
  getConfig('dist/xdux.js', 'cjs'),
  getConfig('dist/xdux.umd.js', 'umd', true),
]
