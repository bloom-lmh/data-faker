import { Faker, faker } from '@faker-js/faker';
import { DModel } from './DataModel';
import { DataFakeCb, DataFakeOptions, LocaleType } from '@/types/faker';
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
  static callbacks: Array<(data: any) => any> = [];

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
  static setCallbacks(callbacks: DataFakeCb) {
    if (typeof callbacks === 'function') {
      this.callbacks.push(callbacks);
    }
    if (Array.isArray(callbacks) && callbacks.length > 0) {
      this.callbacks = [...this.callbacks, ...callbacks];
    }
  }
  /**
   * 伪造数据
   */
  static fake(dataModel: DModel | string | symbol, options?: DataFakeOptions) {
    // 获取生成数据规则和回调
    const { count, refRules, callbacks, locale } = options || {};
    // 与全局语言环境合并
    let lc = LocaleParser.parseLocale(locale) || this.locale;
    // 解析数据
    let data = ModelParser.setLocale(lc).parseModel(dataModel, count, refRules);
    // 数据后处理
    let cbs = [...this.callbacks];
    if (typeof callbacks === 'function') {
      cbs.push(callbacks);
    }
    if (Array.isArray(callbacks) && callbacks.length > 0) {
      cbs = [...cbs, ...callbacks];
    }
    cbs.forEach((cb) => {
      data = cb(data);
    });
    return data;
  }
}

/**
 * 伪造数据
 */
export function fakeData(dataModel: DModel | string | symbol, options?: DataFakeOptions) {
  return DataFaker.fake(dataModel, options);
}
