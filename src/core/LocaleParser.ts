import { LocaleType } from '@/types/faker';
import { allFakers, allLocales, faker, Faker, LocaleDefinition } from '@faker-js/faker';

/**
 * 语言解析器
 */
export class LocaleParser {
  /**
   * faker缓存
   */
  private static fakerCache = new Map<string, Faker>();
  /**
   * 解析语言环境
   * @param locale 语言选项
   */
  static parseLocale(locale?: LocaleType) {
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
        .map((lc) => {
          if (typeof lc === 'string') {
            return allLocales[lc];
          }
          return lc;
        })
        .filter((f) => f);

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
    return localeFaker;
  }
}
