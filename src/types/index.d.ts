/**
 * 构造器
 */
export type Constructor<T = any> = new (...args: any[]) => T;

/**
 * 被装饰类原型
 */
type DecoratedClassProto = {};

/**
 * 被装饰类
 */
export type DecoratedClass<T = any> = Constructor<T>;

/**
 * 被装饰类或原型
 */
export type DecoratedClassOrProto = DecoratedClass | DecoratedClassProto;

/**
 * 类装饰器
 */
export type ClassDecorator = (target: DecoratedClass) => void;

/**
 * 方法装饰器
 */
export type MethodDecorator = (
  target: DecoratedClassOrProto,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<any>,
) => void;

/**
 * 属性装饰器
 */
export type PropertyDecorator = (target: DecoratedClassOrProto, propertyKey: string) => void;

/**
 * 装饰器信息模板
 */
export interface DecorationInfo {
  /**
   * 装饰器编号
   */
  id?: string;
  /**
   * 装饰器信息名称
   */
  name: string | symbol;

  /**
   * 装饰器信息配置
   */
  configs?: any[];
  /**
   * 装饰器冲突列表
   */
  conflictList?: (string | symbol)[];
  /**
   * 所依赖的装饰器列表
   */
  dependsOn?: (string | symbol)[];
}

/**
 * 装饰器列表元数据
 */
export type DecoratorInfos = DecorationInfo[];
