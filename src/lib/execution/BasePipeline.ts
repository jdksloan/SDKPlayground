import { Payload } from '../messaging/models/Payload';
import { ExecutionContext } from './../context/ExecutionContext';
import { IFeedback } from './interfaces/IFeedback';
import { IConfiguration } from '../configuration/interfaces/IConfiguration';
import { INano } from './interfaces/INano';
import { IInput } from './interfaces/IInput';
import { IOutput } from './interfaces/IOutput';
import { IPipeline } from './interfaces/IPipeline';
import { BaseAdapter } from '../flow/BaseAdapter';
import { IExecutionContext } from '../context/interfaces/IExecutionContext';

/**
 * A base for all pipelines
 * Contains the common methods and properties that a pipeline needs
 *
 * @export
 * @class Pipeline
 */
export abstract class BasePipeline<T extends Payload> implements IPipeline {
  public readonly pipelineName: string;

  private _disposeInputOutput: boolean = false;
  private readonly _feedback: IFeedback<T>;

  /**
   * Array of all the nanos in the pipeline
   * These are added with the add add nano method and cannot be changed, they are private
   * We don't expose the nanos the pipeline should be self contained.
   *
   * @private
   * @type {INano[]}
   * @memberof Pipeline
   */
  protected _nanos: INano[] = [];

  /**
   * Input adapter used to add receive messsages(payload)
   * Built on the contructor, do not expose for modification
   * @private
   * @type {IInput}
   * @memberof Pipeline
   */
  protected _input: IInput<T> & BaseAdapter<{}>;

  /**
   * Public getter for IInput
   *
   * @readonly
   * @type {IInput}
   * @memberof StaticPipeline
   */
  public get input(): IInput<T> & BaseAdapter<{}> {
    return this._input;
  }

  /**
   * Public getter for IOutput
   *
   * @readonly
   * @type {IOutput}
   * @memberof StaticPipeline
   */
  public get output(): IOutput<T> & BaseAdapter<{}> {
    return this._output;
  }

  /**
   * Output adapter to send messages
   * Built on the contructor, not exposed for modification
   * @private
   * @type {IOutput}
   * @memberof Pipeline
   */
  protected _output: IOutput<T> & BaseAdapter<{}>;

  protected readonly _config: IConfiguration;
  /**
   * Creates an instance of Pipeline.
   * On instantiation we connect to the input
   * Then connect to the output
   * and finally attach the receive message from the input adapter to the message fn.
   * @param {IInput} input
   * @param {IOutput} output
   * @memberof Pipeline
   */
  constructor(
    pipelineName: string,
    config: IConfiguration,
    input: IInput<T> & BaseAdapter<{}>,
    output: IOutput<T> & BaseAdapter<{}> & IFeedback<T>,
    feedback: IFeedback<T> = output
  ) {
    this.pipelineName = pipelineName;
    this._config = config;
    this._input = input;
    this._input.attach(config, this);
    this._output = output;
    this._output.attach(config, this);
    this._feedback = feedback;
  }

  /**
   * Execute takes a payload from the input adapter
   * Creates a new execution context
   * Sets the input data of the execution context
   * Cycles through the nanos and executes them with the new context
   * Once finished checks if the pipeline has an output,
   * if so it changes the payload data to the output.
   * Else keeps the payload data as is.
   * Finally sends the payload on to the output adapter to be consumed.
   *
   * @param {Payload} execute
   * @returns {Promise<void>}
   * @memberof Pipeline
   */
  public async execute(message: T): Promise<void> {
    try {
      const context: IExecutionContext = new ExecutionContext(message.context.origin, message.context);
      context.setData('pipelineName', this.pipelineName);

      await this.executeNanos(context);
      await this.finaliseExecution(context, message);
    } catch (error) {
      error.message = `Pipeline ${this.pipelineName} failed to execute with ${error.message}`;
      console.error(error, this.pipelineName, message);

      this._feedback.handleFeedback(message);
    } finally {
      await this.signalEnd();
    }
  }
  /**
   * Loads the pipeline and links the connections on either side
   *
   * @param {IConfiguration} config
   * @returns {Promise<void>}
   * @memberof Pipeline
   */
  public async load(): Promise<void> {
    await this._input.connect();
    await this._output.connect();
    const execute = this.execute.bind(this);
    await this._input.receiveMessage(execute);
  }

  /**
   * Adds a list of nanos to be executed by the pipeline
   * Adds in sequential order
   *
   * @param {INano[]} nanos
   * @memberof Pipeline
   */
  public addNanos(...nanos: INano[]): void {
    this._nanos.push(...nanos);
  }

  protected async executeNanos(context: IExecutionContext): Promise<void> {
    for (const nano of this._nanos) {
      await nano.execute(context, this._config);
    }
  }

  protected async finaliseExecution(context: IExecutionContext, message: T): Promise<void> {
    if (context.getData('output')) {
      message.data = context.getData('output');
    }
    context.endTime = Date.now();
    message.context.pushExecutionContext(context);
    await this._output.sendMessage(message);
    this._feedback.handleFeedback(message);
  }

  public getSchema() {
    return {
      input: this._input.getSchema(),
      output: this._output.getSchema()
    };
  }

  public async dispose(): Promise<void> {
    this._disposeInputOutput = true;
  }

  protected async signalEnd(): Promise<void> {
    if (this._disposeInputOutput) {
      await this._input.dispose();
      await this._output.dispose();
    }
  }

  public async terminate(): Promise<void> {
    await this.dispose();
    await this.input.terminate();
    await this.output.terminate();
  }
}
