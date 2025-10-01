const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const { resolve } = require('path');

// 控制是否压缩（可通过命令行传入 --environment PRODUCTION）
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  input: 'src/index.ts',

  output: [
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: isProduction ? false : true,
      exports: 'named',
    },
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: isProduction ? false : true,
      exports: 'named',
    },
  ],

  external: [],

  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({
      tsconfig: resolve(__dirname, 'tsconfig.json'),
    }),
    // 只在生产环境启用压缩
    isProduction &&
      terser({
        compress: {
          drop_console: true, // 可选：移除 console.log
          drop_debugger: true,
        },
        format: {
          comments: false, // 移除注释
        },
      }),
  ].filter(Boolean), // 过滤掉 false（即非生产环境不启用 terser）
};
