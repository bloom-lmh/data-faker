import { DataFieldType } from '@/types/faker';
import { DModel } from './DataModel';
import { ObjectUtils } from '@/utils/ObjectUtils';
import { ClassDecoratorStateManager } from '@/common/ClassDecoratorStateManager';
import { DECORATORNAME } from '@/constants/DecoratorConstants';
import { DecoratedClass } from '@/types/decorator';

/**
 * 模型管理器
 */
export class ModelManager {
  /**
   * 数据模型映射
   */
  private static dataModelMap: Map<string | symbol, DModel> = new Map();
  /**
   * 定义模型
   */
  static defineModel(modelName: string | symbol, modelSchema: Record<string, DataFieldType>) {
    // 创建数据模型对象
    let dataModel = new DModel(modelName, modelSchema);
    // 注入工厂
    ModelManager.registerDataModel(modelName, dataModel);
    // 返回一个可修改的模型对象
    return dataModel;
  }

  /**
   * 克隆模型
   */
  static cloneModel(newModelName: string | symbol, dataModel: DModel) {
    // 获取模型Schema
    const modelSchema = dataModel.getModelSchema();
    let newModelSchema = ObjectUtils.deepClone(modelSchema);
    return new DModel(newModelName, newModelSchema);
  }

  /**
   * 使用模型
   */
  static useModel(target: DecoratedClass | string | symbol) {
    let modelName;
    if (typeof target === 'function') {
      // 获取装饰器配置
      const decoratorInfo = ClassDecoratorStateManager.getInstance().getDecoratorInfo(
        target.prototype,
        DECORATORNAME.DATAMODEL
      );
      modelName = decoratorInfo?.configs[0];
    } else {
      modelName = target;
    }
    return modelName ? ModelManager.getDataModel(modelName) : null;
  }
  /**
   * 注册数据模型
   */
  private static registerDataModel(modelName: string | symbol, dataModel: DModel) {
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
  private static hasDataModel(modelName: string | symbol) {
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

/**
 * 定义模型
 */
export function defineModel(modelName: string | symbol, modelSchema: Record<string, DataFieldType>) {
  return ModelManager.defineModel(modelName, modelSchema);
}
/**
 * 克隆模型
 */
export function cloneModel(newModelName: string | symbol, dataModel: DModel) {
  return ModelManager.cloneModel(newModelName, dataModel);
}

/**
 * 使用模型
 */
export function useModel(target: DecoratedClass | string | symbol) {
  return ModelManager.useModel(target);
}
