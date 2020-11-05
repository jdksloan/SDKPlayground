import { ExecutionContext } from './ExecutionContext';
import { IRequestContext } from './interfaces/IRequestContext';

describe('Test ExecutionContext', () => {
  let now, id;

  beforeEach(() => {
    id = '';
    now = Date.now();
    Date.now = jest.fn().mockImplementation(() => {
      return now;
    });
  });

  test('Instantiation', () => {
    const context = {} as IRequestContext;
    const instance = new ExecutionContext('origin', context);
    expect(instance).toBeInstanceOf(ExecutionContext);
    expect(instance.origin).toEqual('origin');
    expect(instance.id).toBe(id);
    expect(instance.endTime).toBeUndefined();
    expect(instance.requestContext).toBe(context);
  });

  test('setData and getData', () => {
    const instance = new ExecutionContext('origin', {} as IRequestContext);
    instance.setData('some', 'data');
    expect(instance.getData('some')).toEqual('data');
  });

  test('setData existing key', () => {
    let exThrown = false;
    const instance = new ExecutionContext('origin', {} as IRequestContext);
    instance.setData('some', 'data');
    try {
      instance.setData('some', 'anotherData');
    } catch (e) {
      exThrown = true;
      expect(e.message).toBe('Key already exists');
    }
    expect(exThrown).toBeTruthy();
  });
});
