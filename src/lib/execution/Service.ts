import { ITask } from './../task/interfaces/ITask';
import { FlowUtils } from './../flow/FlowUtils';
import { IConfiguration } from '../configuration/interfaces/IConfiguration';
import { IService } from './interfaces/IService';
import { IPipeline } from './interfaces/IPipeline';
import { ServiceModel } from './models/ServiceModel';

/**
 * Creates the microservice
 * Wraps all the functionality of running an elements microservice
 * Gets the configuration from the configuration provider microservice
 * Adds all the pipelines
 * Finally runs the server and executres the pipelines
 *
 * @export
 * @class Service
 */
export class Service implements IService {
  public serviceName: string;

  private _pipelines: IPipeline[] = [];
  private _startupAttempts: number;
  private _onLoadTasks: ITask[];

  public get pipelines(): IPipeline[] {
    return this._pipelines;
  }

  /**
   * Creates an instance of Service.
   * @param {string} serviceName
   * @param {number} port
   * @param {IConfiguration} config
   * @param {string} redisConnKey
   * @param {string} redisChanKey
   * @param {IHealthCheck} healthCheck
   * @memberof Service
   */
  constructor(serviceModel: ServiceModel, ...onloadTasks: ITask[]) {
    this.serviceName = serviceModel.serviceName;
    this._startupAttempts = 0;
    this._onLoadTasks = onloadTasks;
    this.terminate = this.terminate.bind(this);
    process.on('SIGTERM', this.terminate);
    process.on('SIGINT', () => process.exit());
  }

  private async terminate(): Promise<void> {
    try {
      console.info(`Termination signal detected for service`);

      const terminationPromises: Array<Promise<void>> = [];

      for (const pipeline of this.pipelines) {
        if (!pipeline) {
          continue;
        }
        terminationPromises.push(pipeline.terminate());
      }

      await Promise.all(terminationPromises);
    } catch (err) {
      console.error(err);
    } finally {
      process.exit();
    }
  }

  /**
   * Adds a pipeline to the active and store
   *
   * @param {IPipeline} pipeline
   * @memberof Service
   */
  public addPipelines(...pipeline: IPipeline[]): void {
    this._pipelines.push(...pipeline);
  }

  private async onLoad(): Promise<void> {
    try {
      const promises: Array<Promise<any>> = [];
      for (const key in Object.keys(this._onLoadTasks)) {
        if (this._onLoadTasks[key]) {
          const task = this._onLoadTasks[key];
          promises.push(task.execute(this));
        }
      }
      await Promise.all(promises);
    } catch (error) {
      throw new Error(`Service ${this.serviceName} failed to load with error: ${error}`);
    }
  }

  public async start(retryAttempts: number = 10, retryInterval: number = 5000): Promise<void> {
    const promises: Array<Promise<any>> = [];

    try {
      console.info(`Starting ${this.serviceName}`);

      if (this._onLoadTasks.length > 0) {
        promises.push(this.onLoad());
      }

      for (let i = 0; i < this._pipelines.length; i++) {
        promises.push(this._pipelines[i].load());
      }

      await Promise.all(promises);
    } catch (error) {
      this._startupAttempts++;
      if (this._startupAttempts <= retryAttempts) {
        console.warn(error, undefined, { remarks: `Start attempt ${this._startupAttempts} of ${retryAttempts} failed. Attempting to restart...` });
        await FlowUtils.sleep(retryInterval);
        await this.start(retryAttempts, retryInterval);
      } else {
        console.error(error);
      }
    }
  }
}
