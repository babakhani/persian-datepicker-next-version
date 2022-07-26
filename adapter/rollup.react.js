import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import banner from 'rollup-plugin-banner'
import cleanup from 'rollup-plugin-cleanup'
// eslint-disable-next-line no-unused-vars
import pkg from '../package.json'
import sveltePreprocess from 'svelte-preprocess'
const preprocess = sveltePreprocess({
  scss: {
    includePaths: ['src'],
  },
  postcss: {
    plugins: [require('autoprefixer')],
  },
})
const production = !process.env.ROLLUP_WATCH
export default {
  input: 'adapter/plugin-react.js',
  output: {
    sourcemap: true,
    format: 'esm',
    extend: true,
    name: pkg.name,
    file: `dist/pwt-datepicker-react.js`,
  },
  plugins: [
    svelte({
      dev: !production,
      preprocess,
      css: css => {
        css.write(`pwt-datepicker.css`)
      },
    }),
    resolve({
      browser: true,
      dedupe: importee =>
        importee === 'svelte' || importee.startsWith('svelte/'),
    }),
    commonjs(),
    production && terser(),
    banner(`
<%= pkg.name %>
v<%= pkg.version %>
<%= pkg.author %>
license <%= pkg.license %>
<%= pkg.homepage %>
    `),
    cleanup(),
  ],
  watch: {
    chokidar: {
      usePolling: true
    },
    clearScreen: false,
  },
}
