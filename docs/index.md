---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
hero:
  name: 'DataFaker'
  text: '一款强大的数据mock工具，依托faker.js，实现各种场景的数据mock'
  tagline: My great project tagline
  actions:
    - theme: brand
      text: 什么是DataFaker？
      link: /什么是DataFaker
    - theme: alt
      text: 快速开始
      link: /快速开始
    - theme: alt
      text: GitHub
      link: https://github.com/axios/axios-plus
features:
  - title: 依托faker.js
    details: DataFaker 依托faker.js，提供了丰富的随机数据生成方式，满足各种场景的数据生成需求
  - title: 声明式
    details: DataFaker 提供了声明式的数据模板定义方式，并提供 ts 数据字段类型提示，简化用户数据模板定义
  - title: 面向模型
    details: DataFaker 以数据模型为基本单元，封装了数据模板，并提供模型单例的克隆和修改机制，让模型能在复用的前提下最大限度适应环境变化
  - title: 数据关联
    details: DataFaker 沿用了 faker.js 的数据关联思想，通过上下文机制，让不同数据直接可以产生依赖，让用户生成数据更合理
  - title: 递归数据生成
    details: DataFaker 有强大的自引用数据生成机制，只需要做简单的配置即可生成树状数据，减少用户心智负担
  - title: 组合式数据
    details: DataFaker 支持基于回调的数据后处理机制,让生成的数据可与其它模型数据相组合，满足组合式要求
  - title: 个性化配置
    details: DataFaker 支持数据生成规则配置，最大化满足你数据生成要求，并且约定大于配置。其中运行时配置优先级大于静态模板配置
  - title: 语法糖
    details: DataFaker 还支持装饰器语法糖，可以在类上直接通过注解定义模型，并允许基于类的模型继承机制
---
