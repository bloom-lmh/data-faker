# Getting Started

[Official Website](https://df-docs-b8ktmo4q6-bloom-lmh.vercel.app/)
[中文官网](https://datafaker-9j23z0sk.maozi.io/)

## Introduction

`DataFaker` is a data generator that relies on `faker.js` under the hood while extending it with template syntax. It enables you to quickly generate various types of data, including referenced data and recursive data, meeting your data generation needs across different scenarios. It is particularly suitable for the following use cases:

- Mock data for front-end development
- Unit testing and integration testing
- API interface prototyping
- Database sample data generation
- Demonstration and teaching examples

[A Tribute to faker.js](https://faker.nodejs.cn/guide/)

## Features

- **Non-intrusive**: `DataFaker` only enhances `faker.js` without modifying it. You can still use `faker.js` as you did before.
- **Templating**: `DataFaker` defines data structures using templates, similar to defining database table structures.
- **Model-oriented**: `DataFaker` encapsulates templates into models, using models as basic units and providing a model reuse mechanism to allow your data templates to be reused in multiple places.
- **Context mechanism**: `DataFaker` adopts a context mechanism to maintain the correlation between data.
- **Multi-language support**: Leveraging the underlying `faker.js`, `DataFaker` also supports more than 70 language environments.
- **Multi-data source**: With the help of `faker.js`'s underlying database, `DataFaker` can generate data covering 26 categories such as animals and books.
- **Configurable**: `DataFaker` supports personalized configuration methods.

# Basic Usage

Using `DataFaker` is very simple; you just need to:

1. Define a data model
2. Generate data

## Defining a Model - defineModel

The `defineModel` method is used to define a data model and accepts two parameters:

- Model name
- Data template

```ts
// Define the model
const userModel = defineModel('user', {
  id: 'string.uuid',
  name: 'person.fullName',
  age: ['number.int', { min: 18, max: 30 }],
});
```

## Generating Data - fakeData

Use the `fakeData` function and pass in the data model to generate data matching the model template object, as shown below:

```ts
// Generate data
const data = fakeData(userModel);
console.log(data);
```

The generated data is as follows:

```json
{
  "id": "5bdfc8e5-3b33-4560-b4ca-8b32b0150661",
  "name": "Malcolm Simonis",
  "age": 18
}
```

# Core Concepts

## Template Syntax

`DataFaker` defines data structures through templates, just like defining a database table—each data structure is a `schema`.

```ts {15-20}
const addressModel = defineModel('address', {
  country: 'location.country',
  city: 'location.city',
});
const userModel = defineModel('user', {
  id: 'number.int',
  firstName: 'person.firstName',
  secondName: 'person.lastName',
  age: ['number.int', { min: 18, max: 65 }],
  hobby: ['helpers.arrayElements', ['Basketball', 'Football', 'Table Tennis', 'Badminton']],
  email: ctx => {
    return faker.internet.email({ firstName: ctx.firstName, lastName: ctx.secondName });
  },
  address: addressModel,
  children: {
    // Reference the model itself; in this case, you must use the model alias 'user' instead of userModel
    refModel: 'user',
    // Control the depth of self-referential recursion
    deep: 3,
  },
});
const userDatas = fakeData(userModel);
console.dir(userDatas, { depth: Infinity });
```

## Model Reuse

The `cloneModel` function allows you to clone a model, which requires two parameters:

- Parameter [1]: The alias of the new cloned model
- Parameter [2]: The model object to be cloned

For example, we take the `userModel` as a prototype to clone a student model and name its alias `studentModel`:

```ts {2,17-19}
// User model
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
    // Control the depth of self-referential recursion
    deep: 1,
  },
});
// Clone the student model
const studentModel = cloneModel('student', userModel);
const studentDatas = fakeData(studentModel);
console.dir(studentDatas, { depth: Infinity });
```

The generated data is as follows:

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

## Hook Functions

Hook functions are functions executed before, after, or during data generation. They allow you to manipulate data items and templates before, after, or during data generation, changing the way data is generated. `DataFaker` provides four types of hook functions:

- `beforeAllCbs`: Manipulate templates before data generation
- `afterAllCbs`: Manipulate data after data generation
- `beforeEachCbs`: Set templates before data item generation
- `afterEachCbs`: Manipulate data after data item generation

> For example, if you want to add an `id` attribute to all referenced data:

```ts
const addressModel = defineModel('address', {
  country: 'location.country',
  city: 'location.city',
  children: {
    refModel: 'address',
  },
});
// User model
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
        // Add an id to all reference types
        ctx.value['id'] = faker.string.uuid();
      }
      return ctx;
    },
  },
});
console.dir(userDatas, { depth: Infinity });
```

The generated data is as follows:

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

## Referenced Data and Self-Reference

`DataFaker` supports referenced data and the generation of self-referential recursive data.

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
// User model
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

The generated data is as follows:

```json
{
  "firstName": "Lydia",
  "secondName": "Adams",
  "age": 41,
  "address": [
    // First address data
    {
      "country": "Democratic Republic of the Congo",
      "city": "Elisefurt",
      // 1 level of recursion
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
    // Second address data
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
  // First-level children
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
    // Second-level children
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

# Decorator Syntax

## Basic Usage

To better support TypeScript, `DataFaker` introduces decorator syntax. Essentially, decorator syntax is syntactic sugar for `defineModel`, designed to maintain compatibility between existing classes and models.

For example, if your project already has two classes (`User` and `Address`) used as TypeScript types:

```ts
class Address {
  declare city: string;
  declare children: Address[];
}
// User class
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

To utilize these two classes instead of redefining data models with `defineModel`, you can use decorator syntax to define the existing type classes as `User` and `Address` data models:

- Use the `@DataModel` decorator to define a data model, which accepts a model alias as a parameter.
- Use the `@DataField` decorator to define fields, consistent with field definition in [Template Syntax](/Template-Syntax).

As shown below:

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

The data generation result is as follows:

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

## Data Model Inheritance Based on Native Classes

Decorator syntax enables easier model inheritance—simply follow the native inheritance approach without any additional modifications. As shown below, the `User` class inherits the `email` and `children` fields from the `Person` class data model:

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

The generated data is as follows:

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

# Multiple Configuration Methods

## Global Configuration

The following demonstrates defining data generation hook functions globally:

```ts
// Globally define the beforeAllCbs callback function
DataFaker.setHooks({
  beforeAllCbs: schema => {
    console.log(schema);
    return schema;
  },
});
```

## Configuration in Templates

The following demonstrates defining the number of generated reference types in a template:

```ts
const userModel = defineModel('user', {
  firstName: 'person.firstName',
  secondName: 'person.lastName',
  age: ['number.int', { min: 18, max: 65 }],
  address: { refModel: 'address', count: 2 },
});
```

## Runtime Configuration

The following shows configuring the generation method of referenced data at runtime:

```ts
const userDatas = fakeData(userModel, {
  refRules: {
    // Generate 1 piece of address reference data, and then generate 1 piece of address.children self-referential data
    address: {
      [COUNT]: 1,
      children: {
        [COUNT]: 1,
      },
    },
    // The self-referential recursion depth is 1, and only 1 piece of data is generated; the address reference property is the same as above
    children: {
      [DEEP]: 1,
      [COUNT]: 1,
    },
  },
});
```

## Data Iterator

Data Iterators are designed to help you sequentially use data from a collection when generating data, simplifying your code writing. For example, consider the following scenario:

> Need to generate 3 user data entries, each with a different hobby.

If written using traditional `faker.js`, the code would look like this:

```javascript{2,6}
let hobbyArr = ['basketball', 'soccer', 'table tennis'];
let index = 0;
const userModel = defineModel('user', {
  id: 'string.uuid',
  hobby: () => {
    return hobbyArr[index++];
  },
});
console.log(fakeData(userModel, 4));
```

The generated data would be as follows:

```json
[
  { "id": "d16e7a49-5e7a-40a0-97e7-68693ffa7268", "hobby": "basketball" },
  { "id": "268a6a63-5eee-4668-a166-d1b9f8bcf510", "hobby": "soccer" },
  { "id": "2ed907c6-0cdf-40bd-95cf-6aaf3ebe5d1c", "hobby": "table tennis" },
  { "id": "7d9b0df7-7fd3-401d-a7a9-59759a0948b4", "hobby": undefined }
]
```

As you can see, you need to manually maintain the `index` variable, which is inconvenient and prone to confusion with other `index` variables. Therefore, `DataFaker` takes this into account. You only need to obtain an iterator to sequentially use data from the collection, as shown below:

```javascript {2,6}
let hobbyArr = ['basketball', 'soccer', 'table tennis'];
const iterator = IteratorFactory.getIterator(hobbyArr);
const userModel = defineModel('user', {
  id: 'string.uuid',
  hobby: () => {
    return iterator.next().value;
  },
});
console.log(fakeData(userModel, 4));
```

`DataFaker` provides four types of data iterators, which can be obtained from the iterator factory `IteratorFactory`:

- Forward Iterator: `IteratorFactory.getIterator()`
- Reverse Iterator: `IteratorFactory.getReverseIterator()`
- Loop Forward Iterator: `IteratorFactory.getLoopIterator()`
- Loop Reverse Iterator: `IteratorFactory.getLoopReverseIterator()`
