import { IDisposable } from './IDisposable';

/**
 * Contract of an adapter for a Pipeline input
 * All adapters input need to be able to connect and receive a message
 * @export
 * @interface IPipeInput
 */
export interface IInput<T> extends IDisposable {
  connect(): Promise<void>;
  receiveMessage(receiver: (payload: T) => Promise<void>): void;
}
