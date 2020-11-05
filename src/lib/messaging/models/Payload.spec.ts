import { Payload } from './Payload';
import { IRequestContext } from '../../context/interfaces/IRequestContext';

describe('Test Payload', () => {
  test('Instantiation', () => {
    const data = {};
    const context = {} as IRequestContext;
    const instance = new Payload(data, context);
    expect(instance).toBeInstanceOf(Payload);
    expect(instance.data).toBe(data);
    expect(instance.context).toBe(context);
  });
});
