import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import path, { dirname } from 'path';
import dts from 'rollup-plugin-dts';
import copy from 'rollup-plugin-copy';
import { fileURLToPath } from 'url';

const isProduction = process.env.NODE_ENV === 'production';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1. 基础配置（公共部分）
const baseConfig = {
  input: 'src/index.ts',
  plugins: [
    alias({
      entries: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    }),
    resolve(), // 解析 node_modules 中的模块
    commonjs(), // 转换 CommonJS 模块为 ES 模块
    typescript({ tsconfig: './tsconfig.json' }), // TypeScript 编译
    babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' }), // Babel 转译
    copy({
      targets: [
        {
          src: 'src/types/*', // 源文件路径（根据实际路径调整）
          dest: 'dist/types/types', // 目标目录（与类型声明目录保持一致）
        },
      ],
      // 可选：设置为 true 可在开发环境下监听文件变化并自动复制
      watch: !isProduction,
    }),
  ],
};

// 2. 类型文件处理配置（单独提取，方便复用）
const dtsConfig = {
  input: 'src/index.ts', // 从源码入口生成类型（更可靠）
  output: [{ file: 'dist/index.d.ts', format: 'esm' }],
  plugins: [
    dts({
      respectExternal: true,
      include: ['src/**/*.ts', 'src/types/**/*.d.ts'],
    }),
  ],
};

// 3. 生产环境配置
const prodConfig = {
  ...baseConfig,
  output: [
    { file: 'dist/index.esm.js', format: 'esm', sourcemap: false, exports: 'named' },
    { file: 'dist/index.cjs.js', format: 'cjs', sourcemap: false, exports: 'named' },
    { file: 'dist/index.umd.js', format: 'umd', name: 'DataFaker', sourcemap: false },
  ],
  plugins: [
    ...baseConfig.plugins,
    terser({
      // 生产环境启用代码压缩
      compress: { drop_console: true, drop_debugger: true }, // 移除控制台输出和调试语句
      format: { comments: false }, // 移除注释
    }),
  ],
};

// 4. 开发环境配置
const devConfig = {
  ...baseConfig,
  output: [
    { file: 'dist/index.esm.js', format: 'esm', sourcemap: true, exports: 'named' },
    { file: 'dist/index.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' },
    // 开发环境可省略 umd 输出，加快构建速度
  ],
  plugins: baseConfig.plugins, // 不添加压缩插件
};

// 根据环境导出对应配置
export default isProduction ? [prodConfig, dtsConfig] : [devConfig];
