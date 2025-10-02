<script setup>
import DefaultTheme from 'vitepress/theme';
const { Layout } = DefaultTheme;
</script>

<template>
  <!-- 此处将渲染 markdown 内容 -->
  <Layout>
    <template #home-hero-image> aa </template>
  </Layout>
</template>

<style lang="scss" scoped></style>
