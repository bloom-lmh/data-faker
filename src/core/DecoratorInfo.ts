import { DECORATORNAME } from '../constants/DecoratorConstants';
import { DecorationInfo } from '../types/decorator';
import { IdUtils } from '../utils/IdUtils';

/**
 * 装饰器信息建造者
 */
export class DecoratorInfo implements DecorationInfo {
  /**
   * 装饰器信息编号
   */
  readonly id: string = IdUtils.getUUID();

  /**
   * 装饰器名称
   * ..default DECORATORNAME.ANONYMOUSE
   */
  name: string | symbol = DECORATORNAME.ANONYMOUSE;

  /**
   * 装饰器配置
   */
  configs: any[] = [];

  /**
   * 装饰器冲突列表
   */
  conflictList: (string | symbol)[] = [];

  /**
   * 依赖装饰器
   */
  dependsOn: (string | symbol)[] = [];

  /**
   * 构造器
   * ..param decoratorInfo 装饰器信息对象
   * ..returns 装饰器信息对象
   */
  constructor(decoratorInfo?: DecorationInfo) {
    if (!decoratorInfo) {
      return this;
    }
    const { name = 'unknown', configs = [], conflictList = [], dependsOn = [] } = decoratorInfo;
    this.name = name;
    this.configs = configs;
    this.conflictList = conflictList;
    this.dependsOn = dependsOn;
  }

  setName(name: string | symbol) {
    this.name = name;
    return this;
  }

  setConfig(config?: any) {
    if (config) {
      this.configs.push(config);
    }
    return this;
  }

  setConflictList(conflictList: (string | symbol)[]) {
    this.conflictList = conflictList;
    return this;
  }

  setDependsOn(dependsOn: (string | symbol)[]) {
    this.dependsOn = dependsOn;
    return this;
  }
}
