import DefaultTheme from 'vitepress/theme';
import './style/custom.scss';
import Layout from './components/Layout.vue';
import { EnhanceAppContext } from 'vitepress/dist/client/index.js';
// 导出主题对象Theme ，VitePress 总会使用自定义主题对象
export default {
  ...DefaultTheme,
  NotFound: () => '404', // <- this is a Vue 3 functional component
  Layout: Layout,
  enhanceApp(ctx: EnhanceAppContext) {},
};
