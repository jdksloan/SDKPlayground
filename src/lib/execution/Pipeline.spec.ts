import { Payload } from '../messaging/models/Payload';
import { ExecutionContext } from '../context/ExecutionContext';
import { Pipeline } from './Pipeline';
import { IInput } from './interfaces/IInput';
import { IOutput } from './interfaces/IOutput';
import { IRequestContext } from '../context/interfaces/IRequestContext';
import { INano } from './interfaces/INano';
import { IConfiguration } from '../configuration/interfaces/IConfiguration';

describe('Test Pipeline', () => {
  let fakePayload, fakeNano, fakeReqContext, fakeInput, fakeOutput, fakeConfig, model;
  const fakeExCtxOutput = 'dadum';

  beforeEach(() => {
    ExecutionContext.prototype.setData = jest.fn();
    ExecutionContext.prototype.getData = jest.fn().mockImplementation(() => fakeExCtxOutput);

    console.error = jest.fn();
    fakeConfig = {} as IConfiguration;
    fakeReqContext = {
      origin: 'origin'
    } as IRequestContext;
    fakeReqContext.pushExecutionContext = jest.fn();

    fakePayload = {
      context: fakeReqContext,
      data: { name: 'test' }
    } as Payload;

    fakeNano = {
      execute: jest.fn()
    } as INano;

    const fakeSchema = {
      setData: jest.fn(),
      validate: jest.fn().mockReturnValue({ isValid: jest.fn().mockReturnValue(true) })
    };

    fakeInput = {
      connect: jest.fn(),
      receiveMessage: jest.fn(),
      dispose: jest.fn(),
      attach: jest.fn(),
      terminate: jest.fn().mockReturnValue(Promise.resolve()),
      getSchema: jest.fn().mockReturnValue(fakeSchema)
    } as IInput<any>;

    fakeOutput = {
      connect: jest.fn(),
      sendMessage: jest.fn(),
      handleFeedback: jest.fn(),
      dispose: jest.fn(),
      attach: jest.fn(),
      terminate: jest.fn().mockReturnValue(Promise.resolve()),
      getSchema: jest.fn().mockReturnValue(fakeSchema)
    } as IOutput<any>;

    model = Object.assign(fakeSchema, fakePayload.data);
  });

  test('Instantiation', () => {
    const instance = new Pipeline('test', fakeConfig, fakeInput, fakeOutput);
    expect(instance).toBeInstanceOf(Pipeline);
    expect(instance.input).not.toBeUndefined();
    expect(instance.output).not.toBeUndefined();
  });

  test('Get Schema', () => {
    const instance = new Pipeline('test', fakeConfig, fakeInput, fakeOutput);
    const schema = instance.getSchema();
    expect(schema).not.toBeUndefined();
  });

  test('execute', async () => {
    const instance = new Pipeline('test', fakeConfig, fakeInput, fakeOutput);
    instance.addNanos(fakeNano);
    await instance.execute(fakePayload);
    expect(ExecutionContext.prototype.setData).toHaveBeenCalledWith('input', model);
    expect(fakeNano.execute).toHaveBeenCalled();
    expect(ExecutionContext.prototype.getData).toHaveBeenCalled();
    expect(fakePayload.data).toBe(fakeExCtxOutput);
    expect(fakeReqContext.pushExecutionContext).toHaveBeenCalled();
    expect(fakeOutput.sendMessage).toHaveBeenCalledWith(fakePayload);
  });

  test('message no output data', async () => {
    ExecutionContext.prototype.getData = jest.fn();
    const instance = new Pipeline('test', fakeConfig, fakeInput, fakeOutput);
    instance.addNanos(fakeNano);
    await instance.execute(fakePayload);
    expect(ExecutionContext.prototype.setData).toHaveBeenCalledWith('input', model);
    expect(fakeNano.execute).toHaveBeenCalled();
    expect(ExecutionContext.prototype.getData).toHaveBeenCalled();
    expect(fakeReqContext.pushExecutionContext).toHaveBeenCalled();
    expect(fakeOutput.sendMessage).toHaveBeenCalledWith(fakePayload);
  });

  test('Test load', async () => {
    const instance = new Pipeline('test', fakeConfig, fakeInput, fakeOutput);
    await instance.load();

    expect(fakeInput.connect).toHaveBeenCalled();
    expect(fakeOutput.connect).toHaveBeenCalled();

    expect(fakeInput.receiveMessage).toHaveBeenCalled();
  });

  test('validation fails', async () => {
    const fakeRes = {
      isValid: jest.fn().mockImplementation(() => false),
      toString: jest.fn().mockImplementation(() => 'fakeError')
    };

    fakeInput = {
      connect: jest.fn(),
      receiveMessage: jest.fn(),
      dispose: jest.fn(),
      attach: jest.fn(),
      terminate: jest.fn().mockReturnValue(Promise.resolve()),
      getSchema: jest.fn().mockReturnValue({
        setData: jest.fn(),
        validate: jest.fn().mockReturnValue(fakeRes)
      })
    } as IInput<any>;
    const instance = new Pipeline('test', fakeConfig, fakeInput, fakeOutput);
    instance.addNanos(fakeNano);
    await instance.execute(fakePayload);
    expect(console.error).toBeCalledWith(new Error('Pipeline test failed to execute with validation errors: fakeError'), 'test', fakePayload);
  });

  test('validation fails', async () => {
    const fakeRes = {
      isValid: jest.fn().mockImplementation(() => false),
      toString: jest.fn().mockImplementation(() => 'fakeError')
    };

    fakeInput = {
      connect: jest.fn(),
      receiveMessage: jest.fn(),
      dispose: jest.fn(),
      attach: jest.fn(),
      terminate: jest.fn().mockReturnValue(Promise.resolve()),
      getSchema: jest.fn().mockReturnValue({
        setData: jest.fn(),
        validate: jest.fn().mockReturnValue(fakeRes)
      })
    } as IInput<any>;
    const instance = new Pipeline('test', fakeConfig, fakeInput, fakeOutput);
    instance.addNanos(fakeNano);
    await instance.execute(fakePayload);
    expect(fakeOutput.handleFeedback).toHaveBeenCalled();
  });

  test('dispose', async () => {
    const instance = new Pipeline('test', fakeConfig, fakeInput, fakeOutput);
    await instance.dispose();
    await instance.execute(fakePayload);
    expect(fakeInput.dispose).toBeCalled();
    expect(fakeOutput.dispose).toBeCalled();
  });

  test('teminate', async () => {
    const instance = new Pipeline('test', fakeConfig, fakeInput, fakeOutput);
    instance.dispose = jest.fn();
    fakeInput.terminate = jest.fn();
    fakeOutput.terminate = jest.fn();

    await instance.terminate();
    expect(instance.dispose).toHaveBeenCalled();
    expect(fakeInput.terminate).toHaveBeenCalled();
    expect(fakeOutput.terminate).toHaveBeenCalled();
  });
});
