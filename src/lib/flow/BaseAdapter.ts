import { IDisposable } from './../execution/interfaces/IDisposable';
import { IPipeline } from './../execution/interfaces/IPipeline';
import { IConfiguration } from './../configuration/interfaces/IConfiguration';

export abstract class BaseAdapter<T extends {}> implements IDisposable {
  protected _schema: T;
  private _pipeline?: IPipeline;

  protected get pipeline(): IPipeline {
    if (!this._pipeline) {
      throw new Error(`Pipeline interface has not been initialized`);
    }

    return this._pipeline;
  }

  protected releasePipeline() {
    this._pipeline = undefined;
  }

  /**
   * Configuration used by the adpater for
   * connecting, queuename, etc
   * Enables us to have live dynamic configurations
   * from a config service
   *
   * @protected
   * @type {IConfiguration}
   * @memberof RabbitBaseAdapter
   */
  private _config?: IConfiguration;

  public get config(): IConfiguration {
    if (!this._config) {
      throw new Error(`Configuration interface has not been initialized`);
    }

    return this._config;
  }

  constructor(schema: T) {
    this._schema = schema;
  }

  public attach(config: IConfiguration, pipeline: IPipeline) {
    this._config = config;
    this._pipeline = pipeline;
  }

  public getSchema(): T {
    return this._schema;
  }

  public abstract async dispose(): Promise<void>;

  public async terminate(): Promise<void> {
    await this.dispose();
  }
}
