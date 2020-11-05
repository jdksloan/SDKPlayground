import { IConfiguration } from './../../configuration/interfaces/IConfiguration';
import { ServiceModel } from './ServiceModel';

describe('Test Pipeline', () => {
  test('Instantiation', () => {
    const instance = new ServiceModel('', 1, {} as IConfiguration);
    expect(instance).toBeInstanceOf(ServiceModel);
  });
});
