/**
 * 编号生成工具
 */
export class IdUtils {
  /**
   * 初始编号
   */
  private static id = 0;
  /**
   * 获取唯一识别码
   */
  static getUUID() {
    return `${Date.now()}${IdUtils.id++}`;
  }
}
