import { COUNT, DEEP } from '@/constants/DataFakerConstants';
import { ObjectUtils } from '@/utils/ObjectUtils';
import { allFakers, allLocales, Faker, faker, LocaleDefinition } from '@faker-js/faker';

import { DModel } from './DataModel';
import { ModelManager } from './ModelManager';
import {
  CustomGenerator,
  DataFakeOptions,
  DataFieldType,
  FakerModule,
  LocaleType,
  ModelSchema,
  RefModelRule,
} from '@/types/faker';
import { DECORATORNAME } from '@/constants/DecoratorConstants';
import { DecoratedClass } from '@/types';
import { ClassDecoratorStateManager } from '@/common/ClassDecoratorStateManager';

/**
 * FakerApi类
 * 提供定义模型的方法
 */

export class DataFaker {
  /**
   * 当前语言
   * @default 英文环境
   */
  private static locale: Faker = faker;
  /**
   * faker缓存
   */
  private static fakerCache = new Map<string, Faker>();
  /**
   * 设置当前语言环境
   * @param locale 语言环境
   */
  static setLocale(locale?: LocaleType) {
    let localeFaker;
    // 字符串单语言
    if (typeof locale === 'string') {
      localeFaker = allFakers[locale];
    }
    // 直接faker
    else if (locale instanceof Faker) {
      localeFaker = locale;
    }
    // 多语言
    else if (Array.isArray(locale)) {
      let fakerLocale = locale
        .map(lc => {
          if (typeof lc === 'string') {
            return allLocales[lc];
          }
          return lc;
        })
        .filter(f => f);

      const key = locale.join('-');
      if (this.fakerCache.has(key)) {
        localeFaker = this.fakerCache.get(key);
      } else {
        localeFaker = new Faker({
          locale: fakerLocale as LocaleDefinition[],
        });
        this.fakerCache.set(key, localeFaker);
      }
    }
    this.locale = localeFaker || faker;
    return this;
  }

  /**
   * 使用的模型
   */
  static parseModel(dataModel: DModel | string | symbol, count: number = 1, rules: RefModelRule = {}) {
    let model = dataModel instanceof DModel ? dataModel : ModelManager.getDataModel(dataModel);
    if (!model) {
      return null;
    }
    let modelSchema = model.getModelSchema();
    let modelName = model.getModelName();
    /*   rules = rules || {};
    rules[COUNT] = rules[COUNT] === undefined || rules[COUNT] === null ? 1 : rules[COUNT]; */
    const path = new Set<string | symbol>().add(modelName);
    if (count <= 0) {
      return null;
    } else if (count === 1) {
      return this.parseScheme(modelSchema, rules, path);
    } else {
      return Array.from({ length: count }).map(() => this.parseScheme(modelSchema, rules, path));
    }
  }

  /**
   * 解析模式
   */
  private static parseScheme(
    modelSchema: ModelSchema,
    rules: RefModelRule,
    path: Set<string | symbol> = new Set(),
    currentDepth: number = 0,
  ): Record<string | symbol, any> | null {
    // 没有模式返回空
    if (!modelSchema) {
      return null;
    }
    // 检查深度限制
    const maxDepth = (rules[DEEP] as number) ?? Infinity;
    if (currentDepth > maxDepth) return null;
    // 函数队列
    let fnShemaList: Array<Record<string | symbol, CustomGenerator>> = [];
    // schema执行结果
    let result: Record<string | symbol, any> = {};

    // 遍历modelSchema
    for (let [key, schema] of Object.entries(modelSchema)) {
      // 函数最后处理，先加入函数队列
      if (typeof schema === 'function') {
        fnShemaList.push({ [key]: schema });
        continue;
      }
      // 字符串,表示是faker方法路径字符串
      if (typeof schema === 'string') {
        let fakerMethod = this.parsePathMethod(schema);
        if (!fakerMethod || typeof fakerMethod !== 'function') {
          result[key] = null;
        } else {
          result[key] = (fakerMethod! as Function)();
        }
        continue;
      }
      // 处理数组
      if (Array.isArray(schema)) {
        let [methodPath, params] = schema;
        let fakerMethod = this.parsePathMethod(methodPath);
        if (!fakerMethod || typeof fakerMethod !== 'function') {
          result[key] = null;
        } else {
          result[key] = (fakerMethod! as Function)(params);
        }
        continue;
      }
      // 处理引用模型
      if (typeof schema === 'object' && schema !== null) {
        let refModel;
        let rls = rules[key] === undefined || rules[key] === null ? {} : rules[key];

        // 处理规则格式
        if (typeof rls === 'number') {
          rls = { [COUNT]: rls };
        }
        if (Array.isArray(rls)) {
          if (rls.length < 2) throw new Error('数组规则格式错误');
          rls = { [COUNT]: rls[0], [DEEP]: rls[1] };
        }

        // 获取引用模型
        if (schema instanceof DModel) {
          refModel = schema;
        } else {
          // 字符串形式则从模型管理器获取
          refModel = schema.refModel instanceof DModel ? schema.refModel : ModelManager.getDataModel(schema.refModel);
          // 合并默认值,后续配置优先级高于前面
          rls[COUNT] = rls[COUNT] ?? schema.count ?? 1;
          rls[DEEP] = rls[DEEP] ?? schema.deep ?? rules[DEEP];
        }

        if (!refModel) {
          result[key] = null;
          continue;
        }

        const modelName = refModel.getModelName();
        const isCircular = path.has(modelName);

        // 自动处理循环引用
        if (isCircular) {
          rls[DEEP] = rls[DEEP] ?? 4; // 默认循环引用深度限制
        }

        // 克隆path以避免污染
        const newPath = new Set(path).add(modelName);
        if ((rls[COUNT] as number) <= 0) {
          result[key] = null;
        } else if (rls[COUNT] === 1) {
          result[key] = this.parseScheme(refModel.getModelSchema(), rls, newPath, isCircular ? currentDepth + 1 : 0);
        } else {
          result[key] = Array.from({ length: rls[COUNT] as number }, () =>
            this.parseScheme(refModel.getModelSchema(), rls, newPath, isCircular ? currentDepth + 1 : 0),
          );
        }
        continue;
      }
    }
    // 处理函数
    if (fnShemaList && fnShemaList.length > 0) {
      fnShemaList.forEach(fnItem => {
        let [key, value] = Object.entries(fnItem!)[0];
        result[key] = (value as Function)(result);
      });
    }
    return result;
  }

  /**
   * 解析路径方法字符串
   */
  private static parsePathMethod(path: string) {
    const [module, method] = path.split('.');
    if (!module || !method) {
      return null;
    }
    let fakerMethod = this.locale[module as FakerModule][method as keyof Faker[FakerModule]];
    return fakerMethod;
  }
}
/**
 * 定义模型
 */
export function defineModel(modelName: string | symbol, modelSchema: Record<string, DataFieldType>) {
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
export function cloneModel(newModelName: string | symbol, dataModel: DModel) {
  // 获取模型Schema
  const modelSchema = dataModel.getModelSchema();
  let newModelSchema = ObjectUtils.deepClone(modelSchema);
  return new DModel(newModelName, newModelSchema);
}

/**
 * 使用模型
 */
export function useModel(target: DecoratedClass | string | symbol) {
  let modelName;
  if (typeof target === 'function') {
    // 获取装饰器配置
    const decoratorInfo = ClassDecoratorStateManager.getInstance().getDecoratorInfo(
      target.prototype,
      DECORATORNAME.DATAMODEL,
    );
    modelName = decoratorInfo?.configs[0];
  } else {
    modelName = target;
  }
  return modelName ? ModelManager.getDataModel(modelName) : null;
}
/**
 * 伪造数据
 */
export function FakeData(dataModel: DModel | string | symbol, options?: DataFakeOptions) {
  // 获取生成数据规则和回调
  const { count, refRules, callbacks, locale } = options || {};
  DataFaker.setLocale(locale);
  let data = DataFaker.parseModel(dataModel, count, refRules);
  if (typeof callbacks === 'function') {
    return callbacks(data);
  }
  if (Array.isArray(callbacks) && callbacks.length > 0) {
    callbacks.forEach(cb => {
      data = cb(data);
    });
    return data;
  }
  return data;
}
