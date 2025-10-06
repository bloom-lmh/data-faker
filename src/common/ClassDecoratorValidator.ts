import { METADATAKEY } from '../constants/MetaDataConstants';
import { DecoratorValidator } from './DecoratorValidator';
import { DecoratorInfos, DecoratedClass } from '../types/decorator';
/**
 * 类装饰器校验器
 * @description 封装装饰器校验的通用方法
 */
export class ClassDecoratorValidator implements DecoratorValidator {
  /**
   * 类装饰器校验器实例
   */
  private static instance: ClassDecoratorValidator;

  /**
   * 获取单例实例
   */
  static getInstance(): ClassDecoratorValidator {
    return !this.instance ? new ClassDecoratorValidator() : this.instance;
  }

  /**
   * 检查是否有装饰器所要依赖的装饰器
   * @param target 类装饰器
   * @param dpDecorators 依赖的装饰器
   * @param propertyKey 属性名称
   * @description 有一些装饰器需要依赖于其它装饰器的存在才能工作
   */
  hasDependentedDecorator(target: any, dpDecorators: (string | symbol)[]): boolean {
    // 获取属性上的属性装饰器信息
    let decoratorInfos = Reflect.getMetadata(METADATAKEY.DECORATORINFOS, target) as DecoratorInfos;
    // 没有装饰器装饰直接返回false
    if (!decoratorInfos) {
      return false;
    }
    // 判断是否有依赖的装饰器
    return dpDecorators.every(dpDecoratorName => decoratorInfos.some(info => info.name === dpDecoratorName));
  }

  /**
   * 检查类装饰器是否与其它装饰冲突
   */
  isDecoratorConflict(target: DecoratedClass, conflictList: (string | symbol)[]): boolean {
    // 获取类上的装饰器信息
    const decoratorInfos = Reflect.getMetadata(METADATAKEY.DECORATORINFOS, target) as DecoratorInfos;
    // 如果类上没有元数据信息表示没有装饰器，则不冲突
    if (!decoratorInfos || decoratorInfos.length === 0) {
      return false;
    }
    const existingDecorNames = decoratorInfos.map(info => info.name);
    // 若类上已有装饰器包含在冲突列表表示装饰器冲突
    return conflictList.some(conflictDecorName => existingDecorNames.includes(conflictDecorName));
  }
}
