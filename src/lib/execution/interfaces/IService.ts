import { IPipeline } from './IPipeline';

export interface IService {
  pipelines: IPipeline[];
  addPipelines(...pipeline: IPipeline[]): void;
  start(retryAttempts?: number, retryInterval?: number): Promise<void>;
}
