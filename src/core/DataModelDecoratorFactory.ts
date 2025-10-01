import { ClassDecoratorValidator } from '@/common/ClassDecoratorValidator';
import { DECORATORNAME } from '@/constants/DecoratorConstants';
import { defineModel } from './DataFaker';
import { DecoratorInfo } from './DecoratorInfo';
import { ClassDecorator, DecoratedClass } from '@/types';
import { DataFieldType } from '@/types/faker';

/**
 * 数据模型装饰器工厂类
 */
export class DataModelDecoratorFactory {
  /**
   * 装饰器信息
   */
  protected decoratorInfo!: DecoratorInfo;
  /**
   * 装饰器校验器
   */
  protected decoratorValidator: ClassDecoratorValidator = ClassDecoratorValidator.getInstance();

  /**
   * 初始化装饰器信息
   */
  protected initDecoratorInfo(): void {
    this.decoratorInfo = new DecoratorInfo()
      .setName(DECORATORNAME.DATAMODEL)
      .setConflictList([DECORATORNAME.DATAMODEL]);
  }
  /**
   * 校验装饰器
   */
  protected validateDecorator(target: DecoratedClass): void {
    const { conflictList } = this.decoratorInfo;
    if (this.decoratorValidator.isDecoratorConflict(target, conflictList)) {
      throw new Error('装饰器冲突');
    }
  }
  /**
   * 获取模型并注入工厂
   * @param target 被装饰的类
   * @param modelName 模型名
   */
  protected setupState(target: DecoratedClass, modelName: string | symbol): void {
    this.decoratorInfo.setConfig(modelName);
    // 获取模型Schema
    let modelSchema = Reflect.getMetadata('modelSchema', target.prototype);
    modelSchema = this.extendSchema(target.prototype, modelSchema);
    // 创建数据模型对象
    defineModel(modelName, modelSchema);
  }

  /**
   * 递归继承属性
   */
  private extendSchema(target: DecoratedClass, modelSchema: Record<string, DataFieldType>) {
    if (!modelSchema || !target || !target.prototype) {
      return modelSchema;
    }
    const protoSchema = Reflect.getMetadata('modelSchema', target.prototype);
    modelSchema = Object.create(modelSchema, protoSchema);
    this.extendSchema(target.prototype, modelSchema);
    return modelSchema;
  }

  /**
   * 创建装饰器
   * @param modelName 模型名
   */
  public createDecorator(modelName: string | symbol): ClassDecorator {
    return (target: DecoratedClass) => {
      this.initDecoratorInfo();
      this.validateDecorator(target);
      this.setupState(target, modelName);
    };
  }
}
