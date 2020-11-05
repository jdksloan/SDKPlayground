import { MemberType } from './models/MemberType';

/**
 * A collection of static helper methods to manipulate and query objects.
 *
 * @export
 * @class ObjectUtils
 */
export class ObjectUtils {
  /**
   * Gets a property via its string path or array navigation.
   *
   * @private
   * @static
   * @param {any} obj The object that contains the desired property. (i.e. user)
   * @param {any} path The path to the desired property within the desired object. (i.e. address.street or ['address', 'street'])
   * @param {string} [separator='.'] The separator used in the nested properties syntax used in the path. Defaults to '.'
   * @returns {any} The desired property of the object.
   * @memberof ObjectUtils
   */
  public static ResolvePropertyByPath<T>(obj: any, path: any, separator: string = '.'): any {
    if (!obj || !path) {
      return undefined;
    }

    if (!Array.isArray(path) && typeof path !== 'string') {
      return undefined;
    }

    const properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => prev && prev[curr], obj) as T;
  }

  /**
   * Sets a property via its string path or array navigation.
   *
   * @static
   * @param {any} obj The object that contains the desired property. (i.e. user)
   * @param {any} path The path to the desired property within the desired object. (i.e. address.street or ['address', 'street'])
   * @param {any} value The separator used in the nested properties syntax used in the path. Defaults to '.'
   * @param {string} [separator='.'] The separator used in the nested properties syntax used in the path. Defaults to '.'
   * @memberof ObjectUtils
   */
  public static SetPropertyByPath(obj: any, path: any, value: any, separator: string = '.'): void {
    if (!obj || !path) {
      return;
    }

    if (!Array.isArray(path) && typeof path !== 'string') {
      return;
    }

    const properties = Array.isArray(path) ? path : path.split(separator);
    const propertyToSet = properties.pop();

    const parentProperty = properties.reduce((prev: any, curr: any) => {
      if (prev[curr] === undefined) {
        prev[curr] = {};
      }
      return prev[curr];
    }, obj);
    parentProperty[propertyToSet] = value;
  }

  /**
   * Replaces circular references in a JSON.Stringfy
   *
   * @static
   * @returns
   * @memberof ObjectUtils
   */
  public static getCircularReplacer() {
    const seen = new WeakSet();
    return (key: any, value: any) => {
      if (typeof value === 'object' && value !== undefined) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  }

  /**
   * Assigns properties to the target model where they are undefined
   *
   * @static
   * @param {*} target
   * @param {*} source
   * @returns {*}
   * @memberof ObjectUtils
   */
  public static assignMatching(target: any, ...sources: any[]): any {
    for (const source of sources) {
      Object.keys(target).forEach((key: string) => {
        if (!target[key]) {
          target[key] = source[key];
        }
      });
    }
    return target;
  }

  /**
   * Validates if a variable is undefined. If it is it throws a new ElementsError with the specified message.
   *
   * @static
   * @param {(any | undefined)} variable The variable to validate.
   * @param {string} message The message do include in the error.
   * @memberof ObjectUtils
   */
  public static validateUndefinedVariable(variable: any | undefined, message: string): void {
    if (!variable) {
      throw new Error(message);
    }
  }

  /**
   * Removes a propery from an object
   *
   * @static
   * @param {{}} obj
   * @param {string} omitKey
   * @returns
   * @memberof ObjectUtils
   */
  public static omit(obj: {}, omitKey: string) {
    return Object.keys(obj).reduce((result, key) => {
      if (key !== omitKey) {
        (result as any)[key] = (obj as any)[key];
      }
      return result;
    }, {});
  }

  /**
   *
   *
   * @static
   * @param {{}} obj
   * @param {MemberType} [memberTypes=MemberType.allButFunction]
   * @param {number} [maxDepth=10]
   * @param {number} [currentDepth] Do not specify unless you want to start at a certain depth
   * @returns {{}}
   * @memberof ObjectUtils
   */
  public static getCertainMembers(obj: {}, memberTypes: MemberType = MemberType.allButFunction, maxDepth: number = 10, currentDepth?: number): {} {
    if (!obj) {
      return obj;
    }

    const currDepth = currentDepth || 0;
    if (currDepth === maxDepth) {
      return obj;
    }

    const objectKeys = Object.keys(obj);
    const returnObj = {};
    for (const key of objectKeys) {
      const keyType: MemberType | undefined = (MemberType as any)[typeof (obj as any)[key]];
      if (keyType && keyType === MemberType.object) {
        ObjectUtils.getCertainMembers((obj as any)[key], memberTypes, maxDepth, currDepth + 1);
      } else if (keyType && keyType === (keyType & memberTypes)) {
        (returnObj as any)[key] = (obj as any)[key];
      }
    }

    return returnObj;
  }

  public static merge(mergeProp: string, collection: Array<{}>): Array<{}> {
    const merged = new Map();
    for (const item of collection) {
      const propertyValue = (item as any)[mergeProp];
      merged.has(propertyValue) ? merged.set(propertyValue, Object.assign(merged.get(propertyValue), item)) : merged.set(propertyValue, item);
    }
    return Array.from(merged.values());
  }

  public static mergeArrays<T>(...arrays: T[][]) {
    let combined: T[] = [];

    for (const array of arrays) {
      combined = [...combined, ...array];
    }
    return combined.filter((item, index) => combined.indexOf(item) === index);
  }

  public static remove<T>(obj: T, ...keys: string[]) {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)));
  }

  public static isType<T>(object: {}, propToCheck: string): object is T {
    if (propToCheck in object) {
      return true;
    }
    return false;
  }
}
