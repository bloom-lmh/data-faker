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
  DataFieldType,
  BeforeEachReturn,
} from '@/types/faker';
import { faker, Faker } from '@faker-js/faker';
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
   * 使用的模型
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
    let afterCbs = this.hooks.afterCbs;
    const path = new Set<string | symbol>().add(modelName);
    if (count <= 0) {
      return null;
    } else if (count === 1) {
      result = this.parseScheme(modelSchema, rules, path);
    } else {
      result = Array.from({ length: count }).map(() => this.parseScheme(modelSchema, rules, path));
    }
    result = this.executeHooks(afterCbs, result);
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
    // 遍历modelSchema
    for (let [key, schema] of Object.entries(modelSchema)) {
      let schemaType = Array.isArray(schema) ? 'array' : typeof schema;
      // 循环执行前回调
      let newEntry = this.executeHooks<BeforeEachContext, BeforeEachReturn>(this.hooks.beforeEachCbs, {
        key,
        schema,
        type: schemaType as SchemaType,
      });
      key = newEntry.key as string;
      schema = newEntry.schema;
      // 函数最后处理，先加入函数队列
      if (typeof schema === 'function') {
        fnShemaList.push({ [key]: schema });
      }
      // 字符串,表示是faker方法路径字符串
      else if (typeof schema === 'string') {
        let fakerMethod = this.parsePathMethod(schema);
        if (!fakerMethod || typeof fakerMethod !== 'function') {
          result[key] = null;
        } else {
          result[key] = (fakerMethod! as Function)();
        }
      }
      // 处理数组
      else if (Array.isArray(schema)) {
        let [methodPath, params] = schema;
        let fakerMethod = this.parsePathMethod(methodPath);
        if (!fakerMethod || typeof fakerMethod !== 'function') {
          result[key] = null;
        } else {
          result[key] = (fakerMethod! as Function)(params);
        }
      }
      // 处理引用模型
      else if (typeof schema === 'object' && schema !== null) {
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
          rls[DEEP] = rls[DEEP] ?? schema.deep ?? rules[DEEP];
        }

        if (refModel) {
          const modelName = refModel.getModelName();
          const isCircular = path.has(modelName);

          // 自动处理循环引用
          if (isCircular) {
            // 默认循环引用深度为1
            rls[DEEP] = rls[DEEP] ?? 1;
          }

          // 克隆path以避免污染
          const newPath = new Set(path).add(modelName);
          if ((rls[COUNT] as number) <= 0) {
            result[key] = null;
          } else if (rls[COUNT] === 1) {
            result[key] = this.parseScheme(refModel.getModelSchema(), rls, newPath, isCircular ? currentDepth + 1 : 0);
          } else {
            result[key] = Array.from({ length: rls[COUNT] as number }, () =>
              this.parseScheme(refModel.getModelSchema(), rls, newPath, isCircular ? currentDepth + 1 : 0)
            );
          }
        } else {
          result[key] = null;
        }
      }
      // 没有对应的类型
      else {
        result[key] = null;
      }

      // 循环后处理函数(函数类型统一处理)
      if (schemaType !== 'function') {
        result[key] = this.executeHooks<AfterEachContext>(this.hooks.afterEachCbs, {
          key,
          value: result[key],
          result,
          type: schemaType as SchemaType,
        });
      }
    }
    // 处理函数
    if (fnShemaList && fnShemaList.length > 0) {
      fnShemaList.forEach((fnItem) => {
        let [key, value] = Object.entries(fnItem!)[0];
        result[key] = (value as Function)(result);
        /*   result[key] = this.executeHooks(this.hooks.afterEachCbs, {
          key,
          value: result[key],
          result,
          type: 'function',
        }); */
      });
    }
    return result;
  }
  /**
   * 执行hooks
   */
  private static executeHooks<T = any, M = any>(hooks: DataFakeCb = [], ctx: T): M {
    let result: any;
    if (typeof hooks === 'function') {
      result = hooks(ctx);
    }
    if (Array.isArray(hooks) && hooks.length > 0) {
      result = hooks.reduce((prev, cb) => {
        return cb(prev);
      }, ctx);
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
