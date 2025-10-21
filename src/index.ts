// 核心装饰器
export { DataModel } from './core/DataModelDecoratorFactory';
export { DataField } from './core/DataFieldDecoratorFactory';

// 迭代器工厂
export { IteratorFactory } from './core/IteratorFactory';
// 数据生成函数
export { fakeData, DataFaker } from './core/DataFaker';

// 模型管理工具
export { useModel, cloneModel, defineModel } from './core/ModelManager';

// 常量
export { COUNT, DEEP } from './constants/DataFakerConstants';

// 导出 faker 相关（保持原功能）
export * from '@faker-js/faker';
