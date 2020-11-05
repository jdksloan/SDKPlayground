import { IConfiguration } from './../../configuration/interfaces/IConfiguration';
import { IExecutionContext } from './../../context/interfaces/IExecutionContext';

/**
 * Nano contract, all nanos need to be able to be executed
 *
 * @export
 * @interface INano
 */
export interface INano {
  execute(context: IExecutionContext, config: IConfiguration): Promise<void>;
}
