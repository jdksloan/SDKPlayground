import { IExecutionContext } from '../../context/interfaces/IExecutionContext';

/**
 * Property finder interface that exposes a delegate
 * This delegate is used to find a propery in the execution context
 * of type T, where T is the return type of the property
 *
 * @export
 * @interface IPropertyFinder
 * @template T
 */
export interface IPropertyFinder<T, R> {
  (context: IExecutionContext, data?: T): R;
}
