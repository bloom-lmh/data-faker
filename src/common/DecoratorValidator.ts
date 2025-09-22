/**
 * 装饰器校验器
 * @description 封装装饰器校验的通用方法
 */
export abstract class DecoratorValidator {
  /**
   * 装饰器信息
   */
  //protected decoratorInfo: DecoratorInfo;

  /**
   * 检查装饰器依赖的装饰器是否存在
   */
  abstract hasDependentedDecorator(...args: any[]): boolean;
  /**
   * 检查装饰器是否与其它装饰冲突
   */
  abstract isDecoratorConflict(...args: any[]): boolean;
}
