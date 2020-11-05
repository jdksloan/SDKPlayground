import { IDisposable } from './IDisposable';

/**
 * Contract of an adapter for a Pipeline output
 * All output adapters need to be able to connect and send a message
 * @export
 * @interface IPipeOutput
 */
export interface IOutput<T> extends IDisposable {
  connect(): Promise<void>;
  sendMessage(message: T): Promise<void>;
}
