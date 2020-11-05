import { INano } from './INano';
import { IDisposable } from './IDisposable';

export interface IPipeline extends IDisposable {
  pipelineName: string;
  load(): Promise<void>;
  addNanos(...nanos: INano[]): void;
  getSchema(): { input: {}; output: {} };
}
