import { DEEP, COUNT } from '@/constants/DataFakerConstants';
import {
  RefModelRule,
  ModelSchema,
  CustomGenerator,
  FakerModule,
  DataFakeCb,
  DataFakeHook,
  AfterEachContext,
  SchemaType,
  BeforeEachContext,
} from '@/types/faker';
import { faker, Faker, th } from '@faker-js/faker';
import { DModel } from './DataModel';
import { ModelManager } from './ModelManager';

/**
 * 模型解析器
 */
export class ModelParser {
  /**
   * 当前语言
   * @default 英文环境
   */
  private static locale: Faker = faker;

  /**
   * 钩子函数
   */
  private static hooks: DataFakeHook = {};

  /**
   * 引用规则
   */
  private static refRules: RefModelRule = {};

  /**
   * 设置当前语言环境
   * @param locale 语言环境
   */
  static setLocale(locale: Faker) {
    this.locale = locale;
    return this;
  }

  /**
   * 设置钩子函数
   */
  static setHooks(hooks: DataFakeHook = {}) {
    this.hooks = hooks;
    return this;
  }
  /**
   * 设置引用规则
   */
  static setRefRules(refRules: RefModelRule = {}) {
    this.refRules = refRules;
    return this;
  }
  /**
   * 解析模型
   */
  static parseModel(dataModel: DModel | string | symbol, count: number = 1) {
    let model = dataModel instanceof DModel ? dataModel : ModelManager.getDataModel(dataModel);
    if (!model) {
      return null;
    }
    let modelSchema = model.getModelSchema();
    let modelName = model.getModelName();
    let result: any = {};
    let rules = this.refRules;
    let beforeAllCbs = this.hooks.beforeAllCbs;
    let afterAllCbs = this.hooks.afterAllCbs;
    const path = new Set<string | symbol>().add(modelName);
    // 前置处理
    beforeAllCbs && (modelSchema = this.executeHooks<ModelSchema>(beforeAllCbs, modelSchema));
    if (count <= 0) {
      return null;
    } else if (count === 1) {
      result = this.parseScheme(modelSchema, rules, path);
    } else {
      result = Array.from({ length: count }).map(() => this.parseScheme(modelSchema, rules, path));
    }
    // 后置处理
    afterAllCbs && (result = this.executeHooks(afterAllCbs, result));
    return result;
  }

  /**
   * 解析模式
   */
  private static parseScheme(
    modelSchema: ModelSchema,
    rules: RefModelRule,
    path: Set<string | symbol> = new Set(),
    currentDepth: number = 0
  ): Record<string | symbol, any> | null {
    // 没有模式返回空
    if (!modelSchema) {
      return null;
    }
    const maxDepth = (rules[DEEP] as number) ?? Infinity;
    // 检查深度限制
    if (currentDepth > maxDepth) return null;
    // 函数队列
    let fnShemaList: Array<Record<string | symbol, CustomGenerator>> = [];
    // schema执行结果
    let result: Record<string | symbol, any> = {};
    // 路径数组
    let paths = [...path];
    // 所属对象
    let belongTo = paths[paths.length - 1];
    // 前置处理队列
    let beforeEachCbs = this.hooks.beforeEachCbs;
    // 后置处理队列
    let afterEachCbs = this.hooks.afterEachCbs;
    // 遍历modelSchema
    for (let [key, schema] of Object.entries(modelSchema)) {
      let schemaType = Array.isArray(schema) ? 'array' : typeof schema;
      if (beforeEachCbs) {
        // 循环执行前的钩子
        let schemaItem = this.executeHooks<BeforeEachContext>(beforeEachCbs, {
          key,
          schema,
          type: schemaType as SchemaType,
          belongTo,
        });
        key = schemaItem.key as string;
        schema = schemaItem.schema;
      }

      // 函数最后处理，先加入函数队列
      if (typeof schema === 'function') {
        fnShemaList.push({ [key]: schema });
      }
      // 字符串,表示是faker方法路径字符串
      else if (typeof schema === 'string') {
        result[key] = this.parseStringSchema(schema);
      }
      // 处理数组
      else if (Array.isArray(schema)) {
        result[key] = this.parseArraySchema(schema);
      }
      // 处理引用模型
      else if (typeof schema === 'object' && schema !== null) {
        result[key] = this.parseRefSchema(schema, rules, key, path, currentDepth);
        // 删除null项
        if (!result[key]) {
          delete result[key];
        }
      }
      // 没有对应的类型
      else {
        result[key] = null;
      }

      // 循环后处理函数(函数类型统一处理)
      if (schemaType !== 'function' && afterEachCbs) {
        let ctx = this.executeHooks<AfterEachContext>(afterEachCbs, {
          key,
          value: result[key],
          result,
          type: schemaType as SchemaType,
          belongTo,
        });
        result[key] = ctx.value;
      }
    }
    // 处理函数
    if (fnShemaList && fnShemaList.length > 0) {
      fnShemaList.forEach((fnItem) => {
        let [key, value] = Object.entries(fnItem!)[0];
        result[key] = (value as Function)(result);
        if (afterEachCbs) {
          let ctx = this.executeHooks<AfterEachContext>(afterEachCbs, {
            key,
            value: result[key],
            result,
            type: 'function',
            belongTo,
          });
          result[key] = ctx.value;
        }
      });
    }
    return result;
  }
  /**
   * 处理字符串schema
   */
  private static parseStringSchema(schema: string) {
    let fakerMethod = this.parsePathMethod(schema);
    if (!fakerMethod || typeof fakerMethod !== 'function') {
      return null;
    } else {
      return (fakerMethod! as Function)();
    }
  }
  /**
   * 处理数组schema
   */
  private static parseArraySchema(schema: Array<any>) {
    let [methodPath, ...params] = schema;
    let fakerMethod = this.parsePathMethod(methodPath);
    if (!fakerMethod || typeof fakerMethod !== 'function') {
      return null;
    } else {
      return (fakerMethod! as Function).call(this, ...params);
    }
  }
  /**
   * 解析引用对象schema
   */
  private static parseRefSchema(
    schema: any,
    rules: RefModelRule,
    key: string | symbol,
    path: Set<string | symbol>,
    currentDepth: number = 0
  ) {
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
      rls[COUNT] = rls[COUNT] ?? 1;
    } else {
      // 字符串形式则从模型管理器获取
      refModel = schema.refModel instanceof DModel ? schema.refModel : ModelManager.getDataModel(schema.refModel);

      // 合并默认值,后续配置优先级高于前面
      rls[COUNT] = rls[COUNT] ?? schema.count ?? 1;
      rls[DEEP] = rls[DEEP] ?? schema.deep ?? 1;
    }

    if (refModel) {
      const modelName = refModel.getModelName();
      const isCircular = path.has(modelName);

      // 如果是循环引用
      if (isCircular) {
        // 默认循环引用深度为1
        rls[DEEP] = rls[DEEP] ?? 1;
        rls = { ...rls, ...rules };
      }

      // 克隆path以避免污染
      const newPath = new Set(path).add(modelName);
      if ((rls[COUNT] as number) <= 0) {
        return null;
      } else if (rls[COUNT] === 1) {
        return this.parseScheme(refModel.getModelSchema(), rls, newPath, isCircular ? currentDepth + 1 : 0);
      } else {
        let res = Array.from({ length: rls[COUNT] as number }, () =>
          this.parseScheme(refModel.getModelSchema(), rls as RefModelRule, newPath, isCircular ? currentDepth + 1 : 0)
        );
        // 删除最后一层递归为null的数据
        if (!res || res.length === 0 || res.every((item) => item === null)) return null;
        return res;
      }
    }
    return null;
  }
  /**
   * 执行hooks
   */
  private static executeHooks<T = any>(hooks: DataFakeCb = [], params: T): T {
    let result: any;
    if (typeof hooks === 'function') {
      result = hooks(params);
    }
    if (Array.isArray(hooks) && hooks.length > 0) {
      result = hooks.reduce((prev, cb) => {
        return cb(prev);
      }, params);
    }
    return result || params;
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
