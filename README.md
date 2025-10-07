# Data Faker

注意下面的仅仅是演示案例，具体详情请参见
[DataFaker 国外官网](https://df-docs-lgxj441cg-bloom-lmh.vercel.app/)
[DataFaker 国内官网](https://ootjp8xe3-datafaker-9j23z0sk.maozi.io/)

## 起步

### 介绍

`DataFaker` 是一个数据生成器，底层依赖 `faker.js`，并在之上扩展了模板语法，能够帮助你快速生成各类的数据，包括引用数据和递归数据，满足你在不同场景下各类数据的生成需求。它特别适用于以下场景：

- 前端开发中的模拟数据
- 单元测试和集成测试
- API 接口原型设计
- 数据库样本数据生成
- 演示和教学用例

[致敬 faker.js](https://faker.nodejs.cn/guide/)

### 特性

- 无侵入：`DataFaker` 对`faker.js`只做增强不做修改，你仍然可以像以前那样使用 `faker.js`
- 模板化：`DataFaker`以模板的方式来定义数据结构，就像定义数据库表结构那样
- 面向模型：`DataFaker`将模板封装为了模型，以模型为基本单元，提供了模型复用机制，让你的数据模板可在多处复用
- 上下文机制：`DataFaker`采用上下文机制保持数据之间的关联性
- 多语言：`DataFaker`底层依托`faker.js`，其同样也支持 `70` 多种语言环境
- 多数据源：`DataFaker` 借助了 `faker.js` 的底层数据库，能够生成涵盖动物、书本等 `26` 类数据
- 可配置：`DataFaker` 支持个性化配置方式

## 基本使用

`DataFaker`使用起来十分的简单，你只需要：

1. 定义数据模型
2. 生成数据

### 定义模型-defineModel

`defineModel`方法用于定义数据模型，它接受两个参数：

- 模型名称
- 数据模板

```ts
// 定义模型
const userModel = defineModel('user', {
  id: 'string.uuid',
  name: 'person.fullName',
  age: ['number.int', { min: 18, max: 30 }],
});
```

### 生成数据-fakeData

使用`fakeData`函数并传入数据模型就能生成模型模板对象的数据，如下所示：

```ts
// 生成数据
const data = fakeData(userModel);
console.log(data);
```

生成的数据如下：

```json
{
  "id": "5bdfc8e5-3b33-4560-b4ca-8b32b0150661",
  "name": "Malcolm Simonis",
  "age": 18
}
```

## 核心概念

### 模板语法

`DataFaker`通过模板来定义数据结构，就像定义一个数据库表那样，每一个数据结构就是一个`schema`。

```ts {15-20}
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
    // 引用自身，此时必须使用模型别名'user'而不能使用userModel
    refModel: 'user',
    // 控制自引用递归深度
    deep: 3,
  },
});
const userDatas = fakeData(userModel);
console.dir(userDatas, { depth: Infinity });
```

### 模型复用

使用`cloneModel`函数我们能够克隆一个模型，其需要提供两个参数

- 参数 【1】：克隆的新的模型别名
- 参数 【2】：要克隆的模型对象

比如我们以`userModel`模型为原型，克隆出了一个学生模型，并将其别名命名为`studentModel`

```ts {2,17-19}
// 用户模型
const userModel = defineModel('user', {
  id: 'number.int',
  firstName: 'person.firstName',
  secondName: 'person.lastName',
  age: ['number.int', { min: 18, max: 65 }],
  email: ctx => {
    return faker.internet.email({ firstName: ctx.firstName, lastName: ctx.secondName });
  },
  children: {
    refModel: 'user',
    // 控制自引用递归深度
    deep: 1,
  },
});
// 克隆学生模型
const studentModel = cloneModel('student', userModel);
const studentDatas = fakeData(studentModel);
console.dir(studentDatas, { depth: Infinity });
```

生成数据如下：

```json
{
  "id": 6584695714108738,
  "firstName": "Jane",
  "secondName": "Wisoky",
  "age": 21,
  "children": {
    "id": 390307445727788,
    "firstName": "Addie",
    "secondName": "Koch",
    "age": 62,
    "children": {
      "id": 6872368248204444,
      "firstName": "Alexandra",
      "secondName": "Powlowski",
      "age": 29,
      "children": null,
      "email": "Alexandra.Powlowski16@hotmail.com"
    },
    "email": "Addie_Koch@hotmail.com"
  },
  "email": "Jane_Wisoky27@gmail.com"
}
```

### 钩子函数

钩子函数就是在数据生成前后或数据生成中执行的函数，它能让你在数据生成前后或数据生成中操作数据项和模板，改变数据生成方式，`DataFaker`提供了四类钩子函数：

- 数据生成前操作模板-`beforeAllCbs`
- 数据生成后操作数据-`afterAllCbs`
- 数据项生成前设置模板-`beforeEachCbs`
- 数据项生成后操作数据-`afterEachCbs`

> 比如我希望为所有引用数据添加 id`属性

```ts
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
    afterEachCbs: ctx => {
      if (ctx.type === 'object' && ctx.value) {
        // 对所有引用类型添加id
        ctx.value['id'] = faker.string.uuid();
      }
      return ctx;
    },
  },
});
console.dir(userDatas, { depth: Infinity });
```

生成数据如下：

```ts
{
  firstName: 'Ernest',
  secondName: 'Ritchie',
  age: 42,
  address: {
    country: 'Sint Maarten',
    city: 'Joeborough',
    children: {
      country: 'Sudan',
      city: 'Watsicashire',
      children: null,
      id: '6b9dd2aa-26a2-4072-95af-6c63eddd6dc0'
    },
    id: '945e2165-2119-45ee-bd52-b0c0df8a73b1'
  }
}
```

### 引用数据和自引用

`DataFaker`支持引用数据和生成自引用递归数据

```ts
const addressModel = defineModel('address', {
  country: 'location.country',
  city: 'location.city',
  children: {
    refModel: 'address',
    count: 2,
    deep: 1,
  },
});
// 用户模型
const userModel = defineModel('user', {
  firstName: 'person.firstName',
  secondName: 'person.lastName',
  age: ['number.int', { min: 18, max: 65 }],
  address: { refModel: 'address', count: 2 },
  children: {
    refModel: 'user',
    deep: 2,
  },
});
const userDatas = fakeData(userModel);
console.dir(userDatas, { depth: Infinity });
```

生成数据如下：

```json
{
  "firstName": "Lydia",
  "secondName": "Adams",
  "age": 41,
  "address": [
    // 第一个address数据
    {
      "country": "Democratic Republic of the Congo",
      "city": "Elisefurt",
      // 递归1层
      "children": [
        {
          "country": "Nauru",
          "city": "Randalltown"
        },
        {
          "country": "Afghanistan",
          "city": "Commerce City"
        }
      ]
    },
    // 第二个address数据
    {
      "country": "Ecuador",
      "city": "Hamillworth",
      "children": [
        {
          "country": "Reunion",
          "city": "West Greysonland"
        },
        {
          "country": "Italy",
          "city": "Hempstead"
        }
      ]
    }
  ],
  // 第一层children
  "children": {
    "firstName": "Lisette",
    "secondName": "Gutmann",
    "age": 29,
    "address": [
      {
        "country": "Syrian Arab Republic",
        "city": "Leuschkefield",
        "children": [
          {
            "country": "Austria",
            "city": "Hammesstad"
          },
          {
            "country": "Barbados",
            "city": "West Elodyfort"
          }
        ]
      },
      {
        "country": "Colombia",
        "city": "Fort Anastasia",
        "children": [
          {
            "country": "Czechia",
            "city": "Hyattfort"
          },
          {
            "country": "Zambia",
            "city": "West Stefanieborough"
          }
        ]
      }
    ],
    // 第二层children
    "children": {
      "firstName": "Rex",
      "secondName": "Farrell",
      "age": 22,
      "address": [
        {
          "country": "El Salvador",
          "city": "Montyshire",
          "children": [
            {
              "country": "Bangladesh",
              "city": "Port Prince"
            },
            {
              "country": "Svalbard & Jan Mayen Islands",
              "city": "South Siennacester"
            }
          ]
        },
        {
          "country": "Panama",
          "city": "Monterey Park",
          "children": [
            {
              "country": "Vietnam",
              "city": "South Scotworth"
            },
            {
              "country": "Mozambique",
              "city": "Matildeside"
            }
          ]
        }
      ]
    }
  }
}
```

## 装饰器语法

### 基本使用

`DataFaker`为了更好的支持`ts`,引入了装饰器语法，装饰器语法本质上就是`defineModel`的语法糖，它设计的初衷就是为了保持现有类和模型的共通性。
比如现在项目中本来就有`User`和`Address`两个类作为 ts 类型

```ts
class Address {
  declare city: string;
  declare children: Address[];
}
// 用户类
class User {
  declare id: string;
  declare firstName: string;
  declare secondName: string;
  declare age: number;
  declare email: string;
  declare address: Address;
  declare children: User[];
}
```

为了将这两个类利用起来，而不是重新使用`defineModel`来定义数据模型，我们可以使用装饰器语法来将现有的类型类定义为`User`和`Address`数据模型。

- 使用`@DataModel`装饰器定义数据模型，它接受一个模型别名作为参数
- 使用`@DataField`装饰器来定义字段，与[模板语法](/模板语法)中定义字段是一致的

如下所示：

```ts
@DataModel('address')
class Address {
  @DataField('location.city')
  declare city: string;
  @DataField({ refModel: 'address', count: 1, deep: 1 })
  declare children: Address[];
}
@DataModel('user')
class User {
  @DataField('string.uuid')
  declare id: string;
  @DataField('person.firstName')
  declare firstName: string;
  @DataField('person.lastName')
  declare secondName: string;
  @DataField(['number.int', { min: 18, max: 65 }])
  declare age: number;
  @DataField(ctx => {
    return faker.internet.email({ firstName: ctx.firstName, lastName: ctx.secondName });
  })
  declare email: string;
  @DataField({ refModel: 'address', count: 1 })
  declare address: Address;
  @DataField({ refModel: 'user', deep: 1, count: 1 })
  declare children: User[];
}
const userDatas = fakeData('user', 2);
console.dir(userDatas, { depth: Infinity });
```

数据生成结果如下：

```ts
[
  {
    id: 'b8e8ade6-5f37-43d9-b512-4ba0395e5975',
    firstName: 'Cecile',
    secondName: 'MacGyver',
    age: 24,
    address: { city: 'Leviland', children: { city: 'North Georgianna' } },
    children: {
      id: 'f29ea63b-ac69-4832-9586-b82b17f2d40b',
      firstName: 'Floyd',
      secondName: 'Flatley',
      age: 57,
      address: { city: 'Lake Anissa', children: { city: 'North Beverlyshire' } },
      email: 'Floyd.Flatley@hotmail.com',
    },
    email: 'Cecile_MacGyver34@yahoo.com',
  },
  {
    id: '3647b033-470d-40f3-adf9-836df66f7eef',
    firstName: 'Evangeline',
    secondName: 'Kerluke',
    age: 23,
    address: { city: 'Raynorland', children: { city: 'West Rosetta' } },
    children: {
      id: '350c4642-761f-4b36-a6cf-5b1bcf35edcb',
      firstName: 'Aurelio',
      secondName: 'Kuvalis',
      age: 64,
      address: { city: 'Florence-Graham', children: { city: 'New Brock' } },
      email: 'Aurelio_Kuvalis61@yahoo.com',
    },
    email: 'Evangeline.Kerluke@yahoo.com',
  },
];
```

### 基于原生基础的数据模型继承

装饰器语法可以更加方便的实现模型继承，只需要像原生继承那样，无需做任何改动，如下所示，`User` 类从 `Person` 类的数据模型中继承了 `email` 和 `children` 字段：

```ts
@DataModel('person')
class Person {
  @DataField(ctx => {
    return faker.internet.email({ firstName: ctx.firstName, lastName: ctx.secondName });
  })
  declare email: string;
  @DataField({ refModel: 'user', deep: 1, count: 1 })
  declare children: User[];
}
@DataModel('user')
class User extends Person {
  @DataField('string.uuid')
  declare id: string;
  @DataField('person.firstName')
  declare firstName: string;
  @DataField('person.lastName')
  declare secondName: string;
  @DataField(['number.int', { min: 18, max: 65 }])
  declare age: number;
}
const userDatas = fakeData('user', 2);
console.dir(userDatas, { depth: Infinity });
```

生成数据如下：

```ts
[
  {
    children: {
      id: '01beb5dd-d2f8-4602-a4f6-4304d49b1532',
      firstName: 'Anjali',
      secondName: 'Murphy',
      age: 51,
      email: 'Anjali.Murphy@hotmail.com',
    },
    id: '041980c6-164a-4fad-81a2-65a3f9c64359',
    firstName: 'Kristy',
    secondName: 'Ledner',
    age: 62,
    email: 'Kristy_Ledner30@yahoo.com',
  },
  {
    children: {
      id: '2df47ecb-186e-4d9b-a417-4b62dd4906d0',
      firstName: 'Jody',
      secondName: 'Schmeler',
      age: 18,
      email: 'Jody_Schmeler@hotmail.com',
    },
    id: '26450cf7-f190-44dc-ab1b-6ff0faf8e74b',
    firstName: 'Nathanial',
    secondName: 'Schaden',
    age: 19,
    email: 'Nathanial.Schaden96@gmail.com',
  },
];
```

## 多种配置方式

### 全局配置

下面演示全局定义数据生成钩子函数

```ts
// 全局定义beforeAllCbs回调函数
DataFaker.setHooks({
  beforeAllCbs: schema => {
    console.log(schema);
    return schema;
  },
});
```

### 模板中配置

下面演示模板中定义引用类型生成数量

```ts
const userModel = defineModel('user', {
  firstName: 'person.firstName',
  secondName: 'person.lastName',
  age: ['number.int', { min: 18, max: 65 }],
  address: { refModel: 'address', count: 2 },
});
```

### 运行时配置

下面展示运行时配置引用数据生成方式

```ts
const userDatas = fakeData(userModel, {
  refRules: {
    // address引用数据生成一个，然后其address.childern自引用数据生成一个
    address: {
      [COUNT]: 1,
      children: {
        [COUNT]: 1,
      },
    },
    // 自引用递归深度为1，且只生成一个，address引用属性同上
    children: {
      [DEEP]: 1,
      [COUNT]: 1,
    },
  },
});
```
