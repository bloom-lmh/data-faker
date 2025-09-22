import { COUNT, DEEP } from './../../../constant/DataFakerConstants';
import { Faker, allFakers, LocaleDefinition } from '@faker-js/faker';
import { PropertyDecorator } from '../../decorator';
import { DModel } from '@/core/DataModel';

/**
 * faker模块联合类型
 */
type FakerModule = keyof Faker;

/**
 * faker 模块.方法联合类型路径字符串
 * @example book.title,animal.name
 */
type FakerMethodPath<M extends FakerModule = FakerModule> = M extends M
  ? keyof Faker[M] extends string
    ? `${M}.${keyof Faker[M]}`
    : never
  : never;

/**
 * faker方法
 * @description 根据方法路径推断方法类型
 */
type FakerMethod<P extends string> = P extends `${infer M extends FakerModule}.${infer F}`
  ? F extends keyof Faker[M]
    ? Faker[M][F] extends (...args: any) => any
      ? Faker[M][F]
      : never
    : never
  : never;

/**
 * faker方法参数类型
 */
type FakerMethodParamsType<P extends string> = FakerMethod<P> extends (args: infer A) => any ? A : never;

/**
 * 自定义数据生成器
 */
type CustomGenerator = (ctx: Record<string | symbol, any>) => any;

/**
 * 引用模型选项
 */
type RefModelOptions = {
  /**
   * 所引用的模型
   */
  refModel: DModel | string | symbol;
  /**
   * 生成数量
   */
  [COUNT]?: number;
  /**
   * 引用自身时的递归深度
   */
  [DEEP]?: number;
};
/**
 * 引用模型配置
 */
type RefModel = RefModelOptions | DModel;

/**
 * 数据字段类型
 */
type DataFieldType<P extends FakerMethodPath = string> =
  | CustomGenerator
  | RefModel
  | FakerMethodPath
  | [P, FakerMethodParamsType<P>];

/**
 * 字段装饰器配置类型
 */
type DataFieldDecoratorOptions<P extends FakerMethodPath> = DataFieldType<P>;

/**
 * 模型字段结构
 */
type DataField = {
  /**
   * 类型
   */
  fieldSchema: FakerMethodPath | CustomGenerator | RefModel;

  /**
   * 参数
   */
  args?: any;
};

/**
 * 模型数据结构
 */
type ModelSchema = Record<string, DataFieldType>;

/**
 * 所有Fakers联合类型
 */
export type AllFakers = keyof typeof allFakers;

/**
 * 语言环境类型
 */
type LocaleType = AllFakers | Array<LocaleDefinition | AllFakers> | Faker;
/**
 * Fake数据规则
 */
type DataFakeRule = {
  /**
   * 生成数量
   */
  [COUNT]?: number;
  /**
   * 引用自身时的递归深度
   */
  [DEEP]?: number;
  /**
   * 结构递归
   */
  [key: string | symbol]: number | DataFakeRule | [number, number];
};

/**
 * 使用模型配置
 */
type DataFakeOptions = {
  /**
   * 对于引用类型的规则
   */
  rules?: DataFakeRule;

  /**
   * 回调函数
   * @description 对生成的数据进行后处理
   */
  callbacks?: DataFakeCb;
  /**
   * 语言环境
   */
  locale?: LocaleType;
};

/**
 * 数据生成后的回调函数类型
 */
type DataFakeCb = ((data: any) => any) | Array<(data: any) => any>;
