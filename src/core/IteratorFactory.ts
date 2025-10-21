/**
 * 迭代器工厂
 */
export class IteratorFactory {
  /**
   * 创建正向迭代器
   */
  static *getIterator<T, M = any>(
    items: Map<M, T> | Record<string | symbol, T> | T[],
    consumer?: (item: T, index?: number) => any,
  ) {
    const itemsArr = IteratorFactory.preHandleItems(items);
    let csm = consumer;
    while (true) {
      for (let i = 0; i < itemsArr.length; i++) {
        csm = (yield csm && typeof csm === 'function' ? csm(itemsArr[i], i) : itemsArr[i]) || csm;
      }
    }
  }

  /**
   * 循环正向迭代器
   */
  static *getLoopIterator<T, M = any>(
    items: Map<M, T> | Record<string | symbol, T> | T[],
    consumer?: (item: T, index?: number) => any,
  ) {
    const itemsArr = IteratorFactory.preHandleItems(items);
    let csm = consumer;
    while (true) {
      for (let i = 0; i < itemsArr.length; i++) {
        csm = (yield csm && typeof csm === 'function' ? csm(itemsArr[i], i) : itemsArr[i]) || csm;
      }
    }
  }

  /**
   * 创建反向迭代器
   */
  static *getReverseIterator<T, M = any>(
    items: Map<M, T> | Record<string | symbol, T> | T[],
    consumer?: (item: T, index?: number) => any,
  ) {
    const itemsArr = IteratorFactory.preHandleItems(items);

    let csm = consumer;
    for (let i = itemsArr.length - 1; i >= 0; i--) {
      csm = (yield csm ? csm(itemsArr[i], i) : itemsArr[i]) || csm;
    }
    while (true) {
      yield [];
    }
  }

  /**
   * 循环反向迭代器
   */
  static *getLoopReverseIterator<T, M = any>(
    items: Map<M, T> | Record<string | symbol, T> | T[],
    consumer?: (item: T, index?: number) => any,
  ) {
    const itemsArr = IteratorFactory.preHandleItems(items);
    let csm = consumer;
    while (true) {
      for (let i = itemsArr.length - 1; i >= 0; i--) {
        csm = (yield csm ? csm(itemsArr[i], i) : itemsArr[i]) || csm;
      }
    }
  }

  /**
   * 处理数据项
   */
  private static preHandleItems(items: Map<any, any> | Record<any, any> | any[]): any[] {
    if (Array.isArray(items)) {
      return items;
    } else if (items instanceof Map) {
      return [...items.entries()];
    } else if (typeof items === 'object') {
      return Object.entries(items);
    } else {
      return [];
    }
  }
}
