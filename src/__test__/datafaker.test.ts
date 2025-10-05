import { DataFaker } from '@/core/DataFaker';
import { faker, defineModel, fakeData, cloneModel, allFakers, zh_CN, COUNT, DEEP, fa } from '../index';
import { describe, test } from 'vitest';

describe('1.非装饰器语法mock数据测试', () => {
  test('1.1 基本数据生成', () => {
    const addressModel = defineModel('address', {
      country: 'location.country',
      city: 'location.city',
    });
    const userModel = defineModel('user', {
      id: 'number.int',
      firstName: 'person.firstName',
      secondeName: 'person.lastName',
      age: ['number.int', { min: 18, max: 65 }],
      hobby: ['helpers.arrayElements', ['篮球', '足球', '乒乓球', '羽毛球']],
      email: (ctx) => {
        return faker.internet.email({ firstName: ctx.firstName, lastName: ctx.secondeName });
      },
      address: addressModel,
      address2: {
        refModel: 'address',
        count: 3,
      },
      children: {
        refModel: 'user',
        // 控制自引用递归深度
        deep: 3,
      },
    });
    const userDatas = fakeData(userModel);
    console.dir(userDatas, { depth: Infinity });
  });
  test('1.2 模型克隆', () => {
    const addressModel = defineModel('address', {
      country: 'location.country',
      city: 'location.city',
    });
    // 用户模型
    const userModel = defineModel('user', {
      firstName: 'person.firstName',
      secondName: 'person.lastName',
      age: ['number.int', { min: 18, max: 65 }],
      email: (ctx) => {
        return faker.internet.email({ firstName: ctx.firstName, lastName: ctx.secondeName });
      },
      address: { refModel: 'address', count: 1 },
      children: {
        refModel: 'user',
        deep: 3,
      },
    });

    const userDatas = fakeData(userModel, {
      // 当前数据生成数量
      count: 3,
      // 运行时控制引用数据生成规则
      refRules: {
        // 非自引用
        address: {
          [COUNT]: 2,
        },
        // 自引用
        children: {
          [COUNT]: 2,
          [DEEP]: 1,
        },
      },
    });
    console.dir(userDatas, { depth: Infinity });
  });
  test('1.3 指定语言环境', () => {
    DataFaker.setLocale(faker);
    const addressModel = defineModel('address', {
      country: 'location.country',
      city: 'location.city',
    });
    // 用户模型
    const userModel = defineModel('user', {
      firstName: 'person.firstName',
      secondName: 'person.lastName',
      age: ['number.int', { min: 18, max: 65 }],
      email: (ctx) => {
        return faker.internet.email({ firstName: ctx.firstName, lastName: ctx.secondeName });
      },
      address: { refModel: 'address', count: 1 },
      children: {
        refModel: 'user',
        deep: 3,
      },
    });
    const userDatas = fakeData(userModel, {
      // 指定语言环境
      locale: [zh_CN, 'en_AU'],
    });
    console.dir(userDatas, { depth: Infinity });
  });
  test('1.4 全局指定钩子函数', () => {
    DataFaker.setHooks({
      beforeAllCbs: [
        (schema) => {
          // age字段值固定为18而不是{ min: 18, max: 65 }
          schema.age = () => {
            return 18;
          };
          return schema;
        },
        (schema) => {
          // 添加一个hobby字段
          schema.hobby = ['helpers.arrayElements', ['篮球', '乒乓球']];
          return schema;
        },
      ],
    });
    // 用户模型
    const userModel = defineModel('user', {
      firstName: 'person.firstName',
      secondName: 'person.lastName',
      age: ['number.int', { min: 18, max: 65 }],
      email: (ctx) => {
        return faker.internet.email({ firstName: ctx.firstName, lastName: ctx.secondeName });
      },
      address: { refModel: 'address', count: 1 },
    });
    const userDatas = fakeData(userModel);
    console.dir(userDatas, { depth: Infinity });
  });
  test('1.5 运行时指定钩子函数', () => {
    // 用户模型
    const userModel = defineModel('user', {
      firstName: 'person.firstName',
      secondName: 'person.lastName',
      age: ['number.int', { min: 18, max: 65 }],
      email: (ctx) => {
        return faker.internet.email({ firstName: ctx.firstName, lastName: ctx.secondeName });
      },
      address: { refModel: 'address', count: 1 },
    });
    const userDatas = fakeData(userModel, {
      hooks: {
        beforeAllCbs: (schema) => {
          schema.age = () => {
            return 18;
          };
          return schema;
        },
      },
    });
    console.dir(userDatas, { depth: Infinity });
  });
  test('1.6钩子函数合并', () => {
    const addressModel = defineModel('address', {
      country: 'location.country',
      city: 'location.city',
      children: {
        refModel: 'address',
      },
    });
    // 用户模型
    const userModel = defineModel('user', {
      firstName: 'person.firstName',
      secondName: 'person.lastName',
      age: ['number.int', { min: 18, max: 65 }],
      address: { refModel: 'address', count: 1 },
    });
    const userDatas = fakeData(userModel, {
      hooks: {
        afterAllCbs(data) {
          console.log(data);
          return {
            email: faker.internet.email(),
            ...data,
          };
        },
      },
    });
    console.dir(userDatas, { depth: Infinity });
  });

  test('1.7 beforeEach钩子函数修改', () => {
    const addressModel = defineModel('address', {
      country: 'location.country',
      city: 'location.city',
      children: {
        refModel: 'address',
      },
    });
    // 用户模型
    const userModel = defineModel('user', {
      firstName: 'person.firstName',
      secondName: 'person.lastName',
      age: ['number.int', { min: 18, max: 65 }],
      address: { refModel: 'address', count: 1 },
    });
    const userDatas = fakeData(userModel, {
      hooks: {
        beforeEachCbs: (ctx) => {
          if (ctx.type === 'object' && ctx.key === 'address') {
            ctx.schema = () => null;
          }
          return ctx;
        },
      },
    });
    console.dir(userDatas, { depth: Infinity });
  });

  test.only('1.8 afterEach钩子函数递归修改数据', () => {
    const addressModel = defineModel('address', {
      country: 'location.country',
      city: 'location.city',
      children: {
        refModel: 'address',
      },
    });
    // 用户模型
    const userModel = defineModel('user', {
      firstName: 'person.firstName',
      secondName: 'person.lastName',
      age: ['number.int', { min: 18, max: 65 }],
      address: { refModel: 'address', count: 1 },
    });
    const userDatas = fakeData(userModel, {
      hooks: {
        afterEachCbs: (ctx) => {
          if (ctx.type === 'object' && ctx.value) {
            // 对所有引用类型添加id
            ctx.value['id'] = faker.string.uuid();
          }
          return ctx;
        },
      },
    });
    console.dir(userDatas, { depth: Infinity });
  });
});
