/**
 * 对象处理工具
 */
export class ObjectUtils {
  /**
   * 深克隆对象
   */
  public static deepClone(obj: any, hashMap = new WeakMap()): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof RegExp) return new RegExp(obj);
    if (obj instanceof URLSearchParams) {
      const cloned = new URLSearchParams();
      for (const [k, v] of obj.entries()) {
        cloned.append(k, v);
      }
      return cloned;
    }

    if (obj instanceof FormData) {
      const cloned = new FormData(); // 支持拷贝
      for (const [k, v] of obj.entries()) {
        cloned.append(k, v);
      }
      return cloned;
    }
    if (Array.isArray(obj)) {
      if (hashMap.has(obj)) return hashMap.get(obj);
      const cloneArr: any[] = [];
      hashMap.set(obj, cloneArr);
      for (let i = 0; i < obj.length; i++) {
        cloneArr[i] = this.deepClone(obj[i], hashMap);
      }
      return cloneArr;
    }
    if (hashMap.has(obj)) return hashMap.get(obj);
    let cloneObj = Object.create(Object.getPrototypeOf(obj));
    hashMap.set(obj, cloneObj);
    for (let propertyKey in obj) {
      if (obj.hasOwnProperty(propertyKey)) {
        if (typeof obj[propertyKey] === 'object') {
          cloneObj[propertyKey] = this.deepClone(obj[propertyKey], hashMap);
        } else {
          cloneObj[propertyKey] = obj[propertyKey];
        }
      }
    }
    return cloneObj;
  }
}
