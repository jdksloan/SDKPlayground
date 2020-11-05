import { ObjectUtils } from './ObjectUtils';
import { MemberType } from './models/MemberType';

interface ITestable {
  test(): any;
}

describe('Test ObjectUtils', () => {
  describe('ResolvePropertyByPath', () => {
    test('Happy path', () => {
      expect(ObjectUtils.ResolvePropertyByPath({ hola: { que: { tal: 'dubidubi' } } }, 'hola.que.tal')).toBe('dubidubi');
    });

    test('Custom separator', () => {
      expect(ObjectUtils.ResolvePropertyByPath({ hola: { que: { tal: 'dubidubi' } } }, 'hola:que:tal', ':')).toBe('dubidubi');
    });

    test('Path as array', () => {
      expect(ObjectUtils.ResolvePropertyByPath({ hola: { que: { tal: 'dubidubi' } } }, ['hola', 'que', 'tal'])).toBe('dubidubi');
    });

    test('undefined obj', () => {
      expect(ObjectUtils.ResolvePropertyByPath(undefined, 'hola.que.tal')).toBeUndefined();
    });

    test('undefined path', () => {
      expect(ObjectUtils.ResolvePropertyByPath({}, undefined)).toBeUndefined();
    });

    test('Wrong path format', () => {
      expect(ObjectUtils.ResolvePropertyByPath({ hola: { que: { tal: 'dubidubi' } } }, 5)).toBeUndefined();
    });
  });

  describe('SetPropertyByPath', () => {
    test('Happy path', () => {
      const obj = {};
      ObjectUtils.SetPropertyByPath(obj, 'hola.que.tal', 'dubidubi');
      expect(obj).toEqual({ hola: { que: { tal: 'dubidubi' } } });
    });

    test('Custom separator', () => {
      const obj = { hola: {} };
      ObjectUtils.SetPropertyByPath(obj, 'hola:que:tal', 'dubidubi', ':');
      expect(obj).toEqual({ hola: { que: { tal: 'dubidubi' } } });
    });

    test('Path as array', () => {
      const obj = {};
      ObjectUtils.SetPropertyByPath(obj, ['hola', 'que', 'tal'], 'dubidubi');
      expect(obj).toEqual({ hola: { que: { tal: 'dubidubi' } } });
    });

    test('undefined obj', () => {
      ObjectUtils.SetPropertyByPath(undefined, 'hola.que.tal', 'dubidubi');
    });

    test('undefined path', () => {
      const obj = {};
      ObjectUtils.SetPropertyByPath({}, undefined, 'dubidubi');
      expect(obj).toEqual({});
    });

    test('Wrong path format', () => {
      const obj = {};
      ObjectUtils.SetPropertyByPath(obj, 6, 'dubidubi');
      expect(obj).toEqual({});
    });
  });

  describe('getCircularReference', () => {
    test('No circular reference', () => {
      const obj = { hola: {} };
      const str = JSON.stringify(obj, ObjectUtils.getCircularReplacer());
      const parsed = JSON.parse(str);
      expect(parsed).toEqual(obj);
    });

    test('One circular reference', () => {
      const originalObj = { hola: {} };
      const obj: any = { hola: {} };
      obj.myself = obj;
      const str = JSON.stringify(obj, ObjectUtils.getCircularReplacer());
      const parsed = JSON.parse(str);
      expect(parsed).toEqual(originalObj);
    });
  });

  describe('assignMatching', () => {
    test('Object data', () => {
      const obj = { test: undefined, test1: 'test' };
      const obj1 = { test: '123123', notCopied: '123123' };

      const testObj = ObjectUtils.assignMatching(obj, obj1);
      expect(testObj).toEqual({ test: '123123', test1: 'test' });
    });

    test('Object data without undefined props', () => {
      const obj = { test: 'test', test1: 'test' };
      const obj1 = { test: '123123', notCopied: '123123' };

      const testObj = ObjectUtils.assignMatching(obj, obj1);
      expect(testObj).toEqual({ test: 'test', test1: 'test' });
    });
  });

  describe('assignMatching', () => {
    test('Object data', () => {
      const obj = { test: undefined, test1: 'test' };
      const obj1 = { test: '123123', notCopied: '123123' };

      const testObj = ObjectUtils.assignMatching(obj, obj1);
      expect(testObj).toEqual({ test: '123123', test1: 'test' });
    });

    test('Object data without undefined props', () => {
      const obj = { test: 'test', test1: 'test' };
      const obj1 = { test: '123123', notCopied: '123123' };

      const testObj = ObjectUtils.assignMatching(obj, obj1);
      expect(testObj).toEqual({ test: 'test', test1: 'test' });
    });
  });

  describe('validateUndefinedVariable', () => {
    test('No error', () => {
      let test = false;
      try {
        const testObj = ObjectUtils.validateUndefinedVariable('test', 'test');
      } catch (error) {
        test = true;
      }
      expect(test).toBeFalsy();
    });

    test('Error', () => {
      try {
        const testObj = ObjectUtils.validateUndefinedVariable(undefined, 'test');
      } catch (error) {
        expect(error.message).toBe('test');
      }
    });
  });

  describe('getCertainMembers', () => {
    test('No object', () => {
      let test = false;
      try {
        const testObj = ObjectUtils.getCertainMembers((undefined as unknown) as any);
        expect(testObj).toBeUndefined();
      } catch (error) {
        test = true;
      }
      expect(test).toBeFalsy();
    });

    test('Depth 1', () => {
      const fakeObj = {
        test: jest.fn(),
        test1: 'not a function',
        test2: {
          test1: jest.fn()
        }
      };
      let test = false;
      try {
        const testObj = ObjectUtils.getCertainMembers(fakeObj, MemberType.allButFunction, 1);
        expect(testObj).toEqual({
          test1: 'not a function'
        });
      } catch (error) {
        test = true;
      }
      expect(test).toBeFalsy();
    });
  });

  describe('merge', () => {
    test('Basic end match', () => {
      const sortProp = 'polyglotID';
      const providerData = [
        { polyglotID: '1', prop: 2 },
        { polyglotID: '2', propA: 1 },
        { polyglotID: '1', propA: 1 },
        { polyglotID: '3', propA: 1 },
        { polyglotID: '2', prop: 1 }
      ];
      const test = ObjectUtils.merge(sortProp, providerData);
      expect(test).toEqual([
        { polyglotID: '1', prop: 2, propA: 1 },
        { polyglotID: '2', prop: 1, propA: 1 },
        { polyglotID: '3', propA: 1 }
      ]);
    });

    test('Basic dont match', () => {
      const sortProp = 'polyglotID';
      const providerData = [
        { polyglotID: '1', prop: 2 },
        { polyglotID: '2', propA: 1 },
        { polyglotID: '1', propA: 1 },
        { polyglotID: '3', propA: 1 }
      ];
      const test = ObjectUtils.merge(sortProp, providerData);
      expect(test).toEqual([
        { polyglotID: '1', prop: 2, propA: 1 },
        { polyglotID: '2', propA: 1 },
        { polyglotID: '3', propA: 1 }
      ]);
    });
  });

  describe('omit', () => {
    test('Remove item', () => {
      const testObj = ObjectUtils.omit({ test: '132', test1: '123' }, 'test');
      expect(testObj).toEqual({ test1: '123' });
    });
  });

  describe('is type', () => {
    test('Is of Type', () => {
      const test: ITestable = {
        test() {
          return true;
        }
      };
      const testObj = ObjectUtils.isType<ITestable>(test, 'test');
      expect(testObj).toBeTruthy();
    });

    test('Is NOT of Type', () => {
      const test = {
        notTest() {
          return true;
        }
      };
      const testObj = ObjectUtils.isType<ITestable>(test, 'test');
      expect(testObj).toBeFalsy();
    });
  });
});
