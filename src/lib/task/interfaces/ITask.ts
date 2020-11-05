import { IService } from './../../execution/interfaces/IService';

export interface ITask {
  execute(service?: IService): Promise<any>;
}
