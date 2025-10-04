import { DEEP, COUNT } from '@/constants/DataFakerConstants';
import { RefModelRule, ModelSchema, CustomGenerator, FakerModule } from '@/types/faker';
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
   * 设置当前语言环境
   * @param locale 语言环境
   */
  static setLocale(locale: Faker) {
    this.locale = locale;
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
    currentDepth: number = 0
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
          rls[COUNT] = rls[COUNT] ?? 1;
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
            this.parseScheme(refModel.getModelSchema(), rls, newPath, isCircular ? currentDepth + 1 : 0)
          );
        }
        continue;
      }
    }
    // 处理函数
    if (fnShemaList && fnShemaList.length > 0) {
      fnShemaList.forEach((fnItem) => {
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
