import { Payload } from '../messaging/models/Payload';
import { IConfiguration } from '../configuration/interfaces/IConfiguration';
import { IInput } from './interfaces/IInput';
import { IOutput } from './interfaces/IOutput';
import { BasePipeline } from './BasePipeline';
import { BaseAdapter } from '../flow/BaseAdapter';
import { IFeedback } from './interfaces/IFeedback';

/**
 * A pipeline is what a service executes.
 * One service can have 1 - many pipelines
 * The pipeline contains many nanos that it executes in order using the nano array
 * The pipeline message function attaches to the pipeline input adapter and fires the execution of the message function with a payload.
 * When the pipelines message function executes it creates an execution context, executes all the nanos, and injects the context into each nano.
 * Once the nanos have all been executed, any data that is in output is then injected into the payloads data and the send message is sent from the output adapter
 *
 * @export
 * @class Pipeline
 */
export class Pipeline<T extends Payload> extends BasePipeline<T> {
  /**
   * Creates an instance of Pipeline.
   * On instantiation we connect to the input
   * Then connect to the output
   * and finally attach the receive message from the input adapter to the message fn.
   * @param {IInput} input
   * @param {IOutput} output
   * @memberof Pipeline
   */
  constructor(pipelineName: string, config: IConfiguration, input: IInput<T> & BaseAdapter<{}>, output: IOutput<T> & BaseAdapter<{}> & IFeedback<T>, feedback?: IFeedback<T>) {
    super(pipelineName, config, input, output, feedback);
  }
}
