import { DataFieldType, ModelSchema } from '../types/faker';

/**
 * 数据模型
 */
export class DModel {
  /**
   * 模型模板
   */
  private modelSchema!: Record<string | symbol, DataFieldType>;

  /**
   * 模型别名
   */
  private modelName: string | symbol;

  constructor(modelName: string | symbol, modelSchema: Record<string | symbol, DataFieldType>) {
    this.modelName = modelName;
    this.modelSchema = modelSchema;
  }

  /**
   * 添加属性
   */
  withProperty(name: string, type: DataFieldType) {
    this.modelSchema[name] = type;
    return this;
  }
  /**
   * 添加多个属性
   */
  withProperties(properties: Record<string, DataFieldType>) {
    for (const [name, type] of Object.entries(properties)) {
      this.withProperty(name, type);
    }
    return this;
  }
  /**
   * 排除属性
   */
  excludeProperty(name: string | symbol) {
    delete this.modelSchema[name];
    return this;
  }
  /**
   * 排除属性
   */
  excludeProperties(excluedes: (string | symbol)[]) {
    for (const name of excluedes) {
      delete this.modelSchema[name];
    }
    return this;
  }

  /**
   * 获取模板
   */
  getModelSchema(): ModelSchema {
    return this.modelSchema;
  }

  /**
   * 获取模型名
   */
  getModelName(): string | symbol {
    return this.modelName;
  }
}
