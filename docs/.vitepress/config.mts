import { defineConfig } from 'vitepress';
import path from 'path';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'DataFaker',
  description: '强大的数据mock工具，依托faker.js，实现各种数据mock场景',
  vite: {
    resolve: {
      alias: {
        // 配置路径别名
        '@': path.resolve(__dirname, './'),
      },
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: '指南', link: '/docs/什么是DataFaker' }],
    sidebar: [
      {
        text: '简介',
        items: [
          { text: '什么是DataFaker？', link: '/docs/什么是DataFaker' },
          { text: '快速开始', link: '/docs/快速开始' },
          { text: '基本使用', link: '/docs/基本使用' },
        ],
      },
      {
        text: '核心概念',
        items: [
          { text: '模板语法', link: '/docs/模板语法' },
          { text: '数据模型', link: '/docs/数据模型' },
          { text: '递归引用', link: '/docs/递归引用' },
          { text: '核心配置', link: '/docs/核心配置' },
        ],
      },
      {
        text: '实验性功能',
        items: [
          { text: '装饰器语法', link: '/docs/装饰器语法' },
          { text: '模拟业务层', link: '/docs/模拟业务层' },
        ],
      },
      {
        text: '相关链接',
        items: [
          { text: 'faker.js', link: 'https://github.com/Marak/faker.js' },
          { text: 'axios-plus', link: 'https://github.com/axios/axios-plus' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }],
  },
});
function resolve(__dirname: string, arg1: string): string {
  throw new Error('Function not implemented.');
}
