import { Faker, faker } from '@faker-js/faker';
import { DModel } from './DataModel';
import {
  AfterEachContext,
  BeforeEachContext,
  DataFakeCb,
  DataFakeHook,
  DataFakeOptions,
  LocaleType,
  ModelSchema,
} from '@/types/faker';
import { ModelParser } from './ModelParser';
import { LocaleParser } from './LocaleParser';

/**
 * FakerApi类
 * 提供定义模型的方法
 */

export class DataFaker {
  /**
   * 当前语言
   * @default 英文环境
   */
  static locale: Faker = faker;

  /**
   * 全局回调函数
   */
  static hooks: DataFakeHook;

  /**
   * 设置当前语言环境
   * @param locale 语言环境
   */
  static setLocale(locale?: LocaleType) {
    this.locale = LocaleParser.parseLocale(locale) || faker;
  }

  /**
   * 设置全局回调函数
   */
  static setHooks(hooks: DataFakeHook = {}) {
    this.hooks = hooks;
  }
  /**
   * 合并hooks
   */
  static unionHooks(runtimeHooks?: DataFakeHook): DataFakeHook {
    if (!this.hooks) return runtimeHooks || {};
    if (!runtimeHooks) return this.hooks;

    return {
      beforeAllCbs: this.mergeCb(runtimeHooks.beforeAllCbs, this.hooks.beforeAllCbs),
      afterAllCbs: this.mergeCb(runtimeHooks.afterAllCbs, this.hooks.afterAllCbs),
      beforeEachCbs: this.mergeCb(runtimeHooks.beforeEachCbs, this.hooks.beforeEachCbs),
      afterEachCbs: this.mergeCb(runtimeHooks.afterEachCbs, this.hooks.afterEachCbs),
    };
  }
  /**
   * 合并回调函数
   */
  private static mergeCb<T>(a?: DataFakeCb<T>, b?: DataFakeCb<T>): ((data: T) => T)[] {
    const arrA = a ? (Array.isArray(a) ? a : [a]) : [];
    const arrB = b ? (Array.isArray(b) ? b : [b]) : [];
    return [...arrA, ...arrB];
  }
  /**
   * 伪造数据
   */
  static fake(dataModel: DModel | string | symbol, options?: DataFakeOptions | number) {
    // 生成数量
    if (typeof options === 'number') {
      options = { count: options };
    }
    // 获取生成数据规则和回调
    let { count, refRules, hooks, locale } = options || {};
    // 合并hooks
    hooks = this.unionHooks(hooks);
    console.log(hooks);

    // 与全局语言环境合并
    let lc = LocaleParser.parseLocale(locale) || this.locale;
    // 解析数据
    let data = ModelParser.setLocale(lc).setHooks(hooks).setRefRules(refRules).parseModel(dataModel, count);
    // 返回数据
    return data;
  }
}

/**
 * 伪造数据
 */
export function fakeData(dataModel: DModel | string | symbol, options?: DataFakeOptions | number) {
  return DataFaker.fake(dataModel, options);
}
