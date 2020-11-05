import { IConfiguration } from './../../configuration/interfaces/IConfiguration';

export class ServiceModel {
  public serviceName: string;
  public port: number;
  public config: IConfiguration;

  constructor(serviceName: string, port: number, config: IConfiguration) {
    this.serviceName = serviceName;
    this.port = port;
    this.config = config;
  }
}
