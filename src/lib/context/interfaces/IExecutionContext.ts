import { IRequestContext } from './IRequestContext';

/**
 * Specifies what an execution contract should look like
 * Origin is what is the current origin of the request
 * getData and setData refer to an private property
 * The data is the transient data
 * The execution has a ref to the request it's in
 *
 * @export
 * @interface IExecutionContext
 */
export interface IExecutionContext {
  origin: string;
  startTime: number;
  endTime?: number;
  getData<T>(key: string): T;
  setData(key: string, value: any): void;
  requestContext: IRequestContext;
}
