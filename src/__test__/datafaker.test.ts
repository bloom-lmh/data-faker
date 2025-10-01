import { defineModel, FakeData } from '../core/DataFaker';
import { faker } from '@faker-js/faker';
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
      email: ctx => {
        return faker.internet.email({ firstName: ctx.firstName, lastName: ctx.secondeName });
      },
      address: addressModel,
      children: {
        refModel: 'user',
        deep: 1,
      },
    });
    const userDatas = FakeData(userModel, {
      count: 2,
    });
    console.log(userDatas);
  });
});
