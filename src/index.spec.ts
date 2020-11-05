import Test from './lib/models/Test';

describe('Test', () => {
  test('Test', () => {
    console.log = jest.fn();
    Test.test();
    expect(console.log).toBeCalled();
  });
});
