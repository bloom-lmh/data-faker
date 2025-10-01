import { FakerMethodPath, FakerMethodParamsType, CustomGenerator, RefModel } from '@/types/faker';
import { DataFieldDecoratorFactory } from './DataFieldDecoratorFactory';
import { DataModelDecoratorFactory } from './DataModelDecoratorFactory';

/**
 * 数据字段装饰器
 */
export function DataField<P extends string>(
  options: FakerMethodPath | [P, FakerMethodParamsType<P>] | CustomGenerator | RefModel,
) {
  return new DataFieldDecoratorFactory().createDecorator(options);
}

/**
 * 数据模型装饰器
 */
export function DataModel(modelName: string | symbol) {
  return new DataModelDecoratorFactory().createDecorator(modelName);
}
