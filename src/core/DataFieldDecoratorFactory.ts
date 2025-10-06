import { DECORATORNAME } from '../constants/DecoratorConstants';
import { DecoratorInfo } from './DecoratorInfo';
import { PropertyDecoratorValidator } from '../common/PropertyDecoraotrValidator';
import 'reflect-metadata';
import { DecoratedClassOrProto } from '../types/decorator';
import { CustomGenerator, DataFieldType, FakerMethodParamsType, FakerMethodPath, RefModel } from '../types/faker';
/**
 * 数据字段装饰器工厂
 */
export class DataFieldDecoratorFactory {
  /**
   * 装饰器信息
   */
  protected decoratorInfo!: DecoratorInfo;
  /**
   * 装饰器校验器
   */

  protected decoratorValidator: PropertyDecoratorValidator = new PropertyDecoratorValidator();
  /**
   * 初始化装饰
   */
  protected initDecoratorInfo(): void {
    this.decoratorInfo = new DecoratorInfo()
      .setName(DECORATORNAME.DATAFIELD)
      .setConflictList([DECORATORNAME.DATAFIELD]);
  }
  /**
   * 校验装饰器
   */
  protected validateDecorator(target: DecoratedClassOrProto, propertyKey: string | symbol): void {
    const { conflictList } = this.decoratorInfo;
    if (this.decoratorValidator.isDecoratorConflict(target, conflictList, propertyKey)) {
      throw new Error('装饰器冲突');
    }
  }

  /**
   * 设置状态
   * ..param target 被装饰的类或原型
   * ..param propertyKey 被装饰的属性名
   * ..param config  配置
   */
  protected setupState(target: DecoratedClassOrProto, propertyKey: string | symbol, config: DataFieldType): void {
    let modelSchema =
      Reflect.getMetadata('modelSchema', target.constructor) || Reflect.getMetadata('modelSchema', target);
    if (!modelSchema) {
      modelSchema = {
        [propertyKey]: config,
      };
    } else {
      modelSchema[propertyKey] = config;
    }
    Reflect.defineMetadata('modelSchema', modelSchema, target);
  }

  public createDecorator(config: DataFieldType): PropertyDecorator {
    return (target: DecoratedClassOrProto, propertyKey: string | symbol) => {
      this.initDecoratorInfo();
      this.validateDecorator(target, propertyKey);
      this.setupState(target, propertyKey, config);
    };
  }
}

/**
 * 数据字段装饰器
 */
export function DataField<P extends FakerMethodPath>(
  options: FakerMethodPath | [P, FakerMethodParamsType<P>] | CustomGenerator | RefModel,
) {
  return new DataFieldDecoratorFactory().createDecorator(options);
}
