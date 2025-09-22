import { DModel } from './DataModel';

/**
 * 模型管理器
 */
export class ModelManager {
  /**
   * 数据模型映射
   */
  private static dataModelMap: Map<string | symbol, DModel> = new Map();

  /**
   * 注册数据模型
   */
  static registerDataModel(modelName: string | symbol, dataModel: DModel) {
    if (typeof modelName === 'string') {
      modelName = modelName.toLowerCase();
    }
    // 不区分大小写
    if (this.hasDataModel(modelName)) {
      throw new Error(`数据模型"${String(modelName)}"已注册`);
    }
    // 不可重复注册
    this.dataModelMap.set(modelName, dataModel);
  }

  /**
   * 是否有数据模型
   */
  static hasDataModel(modelName: string | symbol) {
    return this.dataModelMap.has(modelName);
  }

  /**
   * 获取数据模型
   */
  static getDataModel(modelName: string | symbol) {
    if (typeof modelName === 'string') {
      modelName = modelName.toLowerCase();
    }
    return this.dataModelMap.get(modelName);
  }
}
