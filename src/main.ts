import { DEEP, COUNT } from './constants/DataFakerConstants';
import { defineModel, FakeData } from './core/DataFaker';

const companyModel = defineModel('company', {
  name: 'company.name',
  buzzPhrase: 'company.buzzPhrase',
});
const jobModel = defineModel('job', {
  type: 'person.jobType',
  company: {
    refModel: companyModel,
  },
  children: {
    refModel: 'job',
  },
});
const addressModel = defineModel('address', {
  country: 'location.country',
  city: 'location.city',
});
const userModel = defineModel('user', {
  id: 'number.int',
  name: 'airline.aircraftType',
  age: ['number.int', { min: 18, max: 65 }],
  hobby: ['helpers.arrayElements', ['篮球', '足球', '乒乓球']],
  email: ctx => {
    return 'hello';
  },
  sex: () => 'M',
  address: () => {
    return FakeData(addressModel);
  },
  job: {
    refModel: jobModel,
  },
  job2: jobModel,
  job3: {
    refModel: 'job',
    [DEEP]: 3,
  },
  children: {
    refModel: 'user',
    [COUNT]: 2,
    [DEEP]: 3,
  },
});
const userDatas = FakeData(userModel, {
  rules: {
    [COUNT]: 5,
    job: {
      [COUNT]: 1,
      [DEEP]: 2,
      children: { [COUNT]: 1, [DEEP]: 3 },
      company: 0,
    },
    job2: 1,
    job3: [1, 2],
    children: {
      [DEEP]: 2,
    },
  },
});
console.log(userDatas);
