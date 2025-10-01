import { METADATAKEY } from '@/constants/MetaDataConstants';
import { DecoratorInfo } from '@/core/DecoratorInfo';
import { DecoratedClass } from '@/types';

/**
 * 类状态管理器
 * @description 管理类的状态，包括定义在类上装饰器的配置，定义在类上的装饰器
 */
export class ClassDecoratorStateManager {
  /**
   * 单例模式
   */
  private static instance: ClassDecoratorStateManager;

  /**
   * 获取实例
   * @returns ClassDecoratorStateManager 单例
   */
  static getInstance(): ClassDecoratorStateManager {
    return this.instance ? this.instance : new ClassDecoratorStateManager();
  }

  /**
   * 初始化类装饰器元数据列表
   * @param target 被装饰的类
   * @param decorationInfos 装饰器信息列表
   */
  initDecoratorInfos(target: DecoratedClass, decorationInfos: DecoratorInfo[] = []): void {
    if (!this.hasDecoratorInfos(target)) {
      Reflect.defineMetadata(METADATAKEY.DECORATORINFOS, decorationInfos, target);
    }
  }

  /**
   * 是否有装饰器信息元数据列表
   */
  hasDecoratorInfos(target: DecoratedClass): boolean {
    return !!Reflect.hasMetadata(METADATAKEY.DECORATORINFOS, target);
  }

  /**
   * 是否有指定装饰器信息元数据
   */
  hasDecoratorInfo(target: DecoratedClass, decoratorName: string | symbol): boolean {
    const decoratorInfos = this.getDecoratorInfos(target);
    if (decoratorInfos) {
      return decoratorInfos.some(info => info.name === decoratorName);
    }
    return false;
  }

  /**
   * 设置类装饰器信息列表元数据
   */
  setDecoratorInfos(target: DecoratedClass, decoratorInfos: DecoratorInfo[]) {
    Reflect.defineMetadata(METADATAKEY.DECORATORINFOS, decoratorInfos, target);
  }

  /**
   * 在类上添加装饰器信息
   */
  setDecoratorInfo(target: DecoratedClass, decoratorInfo: DecoratorInfo) {
    // 获取类上的装饰器信息列表
    const decoratorInfos = this.getDecoratorInfos(target) || [];
    // 若没有装饰器列表信息则初始化
    /*  if (!decoratorInfos) {
      this.setDecoratorInfos(target, [decoratorInfo]);
      return;
    } */
    // 获取已有的重复装饰器信息
    const decoInfo = decoratorInfos.find(info => info.name === decoratorInfo.name);
    //若有重复装饰器则仅添加配置
    if (decoInfo) {
      decoInfo.configs = [...decoInfo.configs, ...decoratorInfo.configs];
    } else {
      decoratorInfos.push(decoratorInfo);
      this.setDecoratorInfos(target, decoratorInfos);
    }
  }

  /**
   * 获取类上所有装饰器信息
   */
  getDecoratorInfos(target: DecoratedClass): DecoratorInfo[] | undefined {
    return Reflect.getMetadata(METADATAKEY.DECORATORINFOS, target);
  }

  /**
   * 获取类上装饰器信息元数据
   */
  getDecoratorInfo(target: DecoratedClass, decoratorName: string | symbol): DecoratorInfo | undefined {
    const decoratorInfos = this.getDecoratorInfos(target);
    if (decoratorInfos) {
      return decoratorInfos.find(info => info.name === decoratorName);
    }
    return undefined;
  }
}
