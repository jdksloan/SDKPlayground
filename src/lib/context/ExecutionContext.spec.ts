import { ElementsFeedback } from './../feedback/models/ElementsFeedback';
import { UserInfo } from './../user/models/UserInfo';
import { ExecutionContext } from './ExecutionContext';
import { IRequestContext } from './interfaces/IRequestContext';
import uuid from 'uuid';
import { UserRequest } from '../user/models/UserRequest';
import { Person } from '../person/Person';
import { TenancySolutions } from '../tenancy/TenancySolutions';

describe('Test ExecutionContext', () => {
  let now, id;

  beforeEach(() => {
    id = 'THIS-IS-AN-AWESOME-ID';
    now = Date.now();
    Date.now = jest.fn().mockImplementation(() => {
      return now;
    });
    jest.spyOn(uuid, 'v4').mockReturnValue(id);
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

  test('toJSON', () => {
    const instance = new ExecutionContext('origin', {} as IRequestContext);
    instance.setData('some', 'data');
    expect(instance.toJSON()).toEqual({ id: id, origin: 'origin', startTime: now, endTime: undefined, _data: { some: 'data' } });
  });

  test('get loggedUserId (authenticated)', () => {
    const instance = new ExecutionContext('origin', {} as IRequestContext);
    instance.requestContext.userRequest = new UserRequest('someRoute', new UserInfo('user@email.com', new Person('', 'THIS-IS-AN-AWESOME-ID', 'Name'), {}));
    expect(instance.loggedUserId).toEqual('THIS-IS-AN-AWESOME-ID');
  });

  test('get loggedUserId (authenticated) fails', () => {
    const instance = new ExecutionContext('origin', {} as IRequestContext);
    try {
      const i = instance.loggedUserId;
    } catch (error) {
      expect(error.message).toBe('User not found');
    }
  });

  test('get readTenancy (authenticated)', () => {
    const instance = new ExecutionContext('origin', {} as IRequestContext);
    instance.requestContext.userRequest = new UserRequest(
      'someRoute',
      new UserInfo('user@email.com', new Person('', 'THIS-IS-AN-AWESOME-ID', 'Name'), { Personal: new TenancySolutions('', 'Personal', true, 'Personal', []) }),
      ['Personal'],
      'Personal'
    );
    expect(instance.readTenancy).not.toBeUndefined();
  });

  test('get read tenancy (authenticated) fails', () => {
    const instance = new ExecutionContext('origin', {} as IRequestContext);
    instance.requestContext.userRequest = new UserRequest('someRoute', new UserInfo('user@email.com', new Person('', 'THIS-IS-AN-AWESOME-ID', 'Name'), {}));
    try {
      const i = instance.readTenancy;
    } catch (error) {
      expect(error.message).toBe('Read Tenancy not found');
    }
  });

  test('get read tenancy (authenticated) fails', () => {
    const instance = new ExecutionContext('origin', {} as IRequestContext);
    try {
      const i = instance.readTenancy;
    } catch (error) {
      expect(error.message).toBe('User not found');
    }
  });

  test('get writeTenancy (authenticated)', () => {
    const instance = new ExecutionContext('origin', {} as IRequestContext);
    instance.requestContext.userRequest = new UserRequest(
      'someRoute',
      new UserInfo('user@email.com', new Person('', 'THIS-IS-AN-AWESOME-ID', 'Name'), { Personal: new TenancySolutions('', 'Personal', true, 'Personal', []) }),
      ['Personal'],
      'Personal'
    );
    expect(instance.writeTenancy).not.toBeUndefined();
  });

  test('get write  (authenticated) fails', () => {
    const instance = new ExecutionContext('origin', {} as IRequestContext);
    try {
      const i = instance.writeTenancy;
    } catch (error) {
      expect(error.message).toBe('User not found');
    }
  });

  test('get write  (authenticated) fails', () => {
    const instance = new ExecutionContext('origin', {} as IRequestContext);
    instance.requestContext.userRequest = new UserRequest('someRoute', new UserInfo('user@email.com', new Person('', 'THIS-IS-AN-AWESOME-ID', 'Name'), {}));
    try {
      const i = instance.writeTenancy;
    } catch (error) {
      expect(error.message).toBe('Write Tenancy not found');
    }
  });

  test('get allowedTenancy (authenticated)', () => {
    const instance = new ExecutionContext('origin', {} as IRequestContext);
    instance.requestContext.userRequest = new UserRequest(
      'someRoute',
      new UserInfo('user@email.com', new Person('', 'THIS-IS-AN-AWESOME-ID', 'Name'), { Personal: new TenancySolutions('', 'Personal', true, 'Personal', []) }),
      ['Personal'],
      'Personal'
    );
    expect(instance.allowedTenancy).not.toBeUndefined();
  });

  test('get allowedTenancy (authenticated) fails', () => {
    const instance = new ExecutionContext('origin', {} as IRequestContext);
    try {
      const i = instance.allowedTenancy;
    } catch (error) {
      expect(error.message).toBe('User not found');
    }
  });

  test('get send feedback', async () => {
    const feeback = { handleFeedback: jest.fn() };
    const instance = new ExecutionContext('origin', {} as IRequestContext, feeback);
    await instance.sendFeedback(new ElementsFeedback<string>('FakeID', 'Could not find it', 404));
    expect(feeback.handleFeedback).toBeCalledTimes(1);
  });

  test('get send feedback failed', async () => {
    const instance = new ExecutionContext('origin', {} as IRequestContext);
    try {
      await instance.sendFeedback(new ElementsFeedback<string>('FakeID', 'Could not find it', 404));
    } catch (err) {
      expect(err.message).toBe('No feedback set for pipeline, did you forget to add it to the pipeline constructor?');
    }
  });
});
