import { IExecutionContext } from './interfaces/IExecutionContext';
import { IRequestContext } from './interfaces/IRequestContext';

/**
 * The context that gets executed for each pipeline
 * Has a reference to the parent RequestContext
 * Contains the transient data between nanos
 * Has timining measurements for logging
 *
 * @export
 * @class ExecutionContext
 * @implements {IExecutionContext}
 */
export class ExecutionContext implements IExecutionContext {
  /**
   * Identity of the pipline GUID raw
   *
   * @type {string}
   * @memberof ExecutionContext
   */
  public id: string;

  /**
   * Origin of the call
   * Usually the websocket id
   *
   * @type {string}
   * @memberof ExecutionContext
   */
  public origin: string;

  /**
   * Start of the execution
   *
   * @type {number}
   * @memberof ExecutionContext
   */
  public readonly startTime: number;

  /**
   * End of the execution
   *
   * @type {number}
   * @memberof ExecutionContext
   */
  public endTime?: number;

  /**
   * Dictionary to save the transient data between nanos
   * Readonly and accessed/set by the getters and setters
   * This data is not persisted unless save to the 'output'
   * @private
   * @type {{ [key: string]: any }}
   * @memberof ExecutionContext
   */
  private readonly _data: { [key: string]: any } = {};

  /**
   * Reference to the Request context
   * Ready only because an execution should not change the request
   *
   * @private
   * @type {IRequestContext}
   * @memberof ExecutionContext
   */
  private _requestContext: IRequestContext;

  /**
   * Creates an instance of ExecutionContext.
   * @param {string} origin
   * @param {IRequestContext} requestContext
   * @memberof ExecutionContext
   */
  constructor(origin: string, requestContext: IRequestContext) {
    this.id = '';
    this.origin = origin;
    this.startTime = Date.now();
    this._requestContext = requestContext;
  }

  /**
   * Getter for the _data dictionary
   * Get by key
   *
   * @param {string} key
   * @returns {*}
   * @memberof ExecutionContext
   */
  public getData<T>(key: string): T {
    return this._data[key] as T;
  }

  /**
   * Settery  for _data dictionary
   * Set by key
   *
   * @param {string} key
   * @param {*} value
   * @memberof ExecutionContext
   */
  public setData(key: string, value: any): void {
    if (this._data[key]) {
      throw new Error('Key already exists');
    }
    this._data[key] = value;
  }

  /**
   * Gets the request context
   *
   * @returns {IRequestContext}
   * @memberof ExecutionContext
   */
  public get requestContext(): IRequestContext {
    return this._requestContext;
  }
}
