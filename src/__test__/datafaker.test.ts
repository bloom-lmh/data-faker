import { DataFaker } from '@/core/DataFaker';
import { faker, defineModel, fakeData, cloneModel } from '../index';
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
  test.only('1.2 模型克隆', () => {
    // 用户模型
    const userModel = defineModel('user', {
      id: 'number.int',
      firstName: 'person.firstName',
      secondName: 'person.lastName',
      age: ['number.int', { min: 18, max: 65 }],
      email: (ctx) => {
        return faker.internet.email({ firstName: ctx.firstName, lastName: ctx.secondeName });
      },
      children: {
        refModel: 'user',
        // 控制自引用递归深度
        deep: 1,
      },
    });
    // 克隆学生模型
    const studentModel = cloneModel('student', userModel)
      .excludeProperty('children')
      .excludeProperties(['secondName', 'age']);

    DataFaker.setCallbacks((data) => {
      data['test'] = 'abc';
      return data;
    });
    DataFaker.setLocale('zh_CN');
    const studentDatas = fakeData(studentModel);
    console.dir(studentDatas, { depth: Infinity });
  });
});
