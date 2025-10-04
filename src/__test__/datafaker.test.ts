import { DataFaker } from '@/core/DataFaker';
import { faker, defineModel, fakeData, cloneModel, allFakers, zh_CN, COUNT, DEEP } from '../index';
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
  test.only('1.4 指定后处理器', () => {
    DataFaker.setCallbacks((data) => {
      data['id'] = faker.string.uuid();
      return data;
    });
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
    });
    const userDatas = fakeData(userModel, {
      callbacks: [
        (data) => {
          return {
            sex: 'male',
            ...data,
          };
        },
        (data) => {
          data.firstName = data.firstName.toUpperCase();
          return data;
        },
      ],
      /* beforeFake: () => {},
      afterFake: () => {}, */
    });
    console.dir(userDatas, { depth: Infinity });
  });
});
