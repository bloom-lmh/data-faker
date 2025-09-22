import { METADATAKEY } from '@/constants/MetaDataConstants';
import { DecoratorValidator } from './DecoratorValidator';
import { DecoratorInfos, DecoratedClass, DecoratedClassProto } from '@/types';

/**
 * 属性装饰器校验器
 */
export class PropertyDecoratorValidator implements DecoratorValidator {
  /**
   * 单例模式
   */
  private static instance: PropertyDecoratorValidator;

  /**
   * 获取PropertyDecoratorValidator实例
   * @returns PropertyDecoratorValidator实例
   */
  static getInstance(): PropertyDecoratorValidator {
    return this.instance ? this.instance : new PropertyDecoratorValidator();
  }

  /**
   * 是否有依赖的装饰器
   * @param target 被装饰的目标对象或其原型
   * @param decoratorName 装饰器名称
   * @param propertyKey 属性名称
   */
  hasDependentedDecorator(target: any, dpDecorators: (string | symbol)[], propertyKey: string | symbol): boolean {
    // 获取属性上的属性装饰器信息
    let decoratorInfos = Reflect.getMetadata(METADATAKEY.DECORATORINFOS, target, propertyKey) as DecoratorInfos;
    // 没有装饰器装饰直接返回false
    if (!decoratorInfos || decoratorInfos.length === 0) {
      return false;
    }
    // 判断是否有依赖的装饰器
    return dpDecorators.every(dpDecoratorName => decoratorInfos.some(info => info.name === dpDecoratorName));
  }

  /**
   * 判断属性上是否存在冲突的装饰器
   * @param target 被装饰的目标对象或其原型
   * @param decoratorName 装饰器名称
   * @param propertyKey 属性名称
   */
  isDecoratorConflict(
    target: DecoratedClass | DecoratedClassProto,
    conflictList: (string | symbol)[],
    propertyKey: string | symbol,
  ): boolean {
    let decoratorInfos = Reflect.getMetadata(METADATAKEY.DECORATORINFOS, target, propertyKey) as DecoratorInfos;
    // 没有装饰器装饰直接返回false
    if (!decoratorInfos || decoratorInfos.length === 0) {
      return false;
    }
    // 获取方法上存在的装饰器名
    let decoratorNames = decoratorInfos.map(info => info.name);
    // 判断存在冲突装饰器
    return conflictList.some(conflictName => decoratorNames.includes(conflictName));
  }
}
