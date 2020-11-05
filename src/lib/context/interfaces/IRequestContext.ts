import { IExecutionContext } from './IExecutionContext';

/**
 * Specifies what a request contract should look like
 * Origin is where did the request come from
 * Contains a list of all the execution contexts for data logging calculations
 * Method to add an execution context
 * Request time is the total time the request took
 * Average execution time is the average of all the requests execution contexts
 * Average latency is the time between the executions,
 * how long does it take for a message to leave one execution and arrive at the next
 *
 * @export
 * @interface IRequestContext
 */
export interface IRequestContext {
  id: string;
  origin: string;
  startTime: number;
  endTime?: number;
  executionContexts: IExecutionContext[];
  pushExecutionContext(ctx: IExecutionContext): void;
  requestTime(): number;
  averageExecutionTime(): number;
  averageExecutionLatency(): number;
}
