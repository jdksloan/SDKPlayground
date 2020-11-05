import { Payload } from './../messaging/models/Payload';
import { IPipeline } from './interfaces/IPipeline';
import { ITask } from './../task/interfaces/ITask';
import { Service } from './Service';
import { ServiceModel } from './models/ServiceModel';
import { IRequestContext } from '../context/interfaces/IRequestContext';

describe('Test Service', () => {
  let fakeTask, fakeConfig, fakePipe, fakePayload, fakeReqContext, fakeInput;

  beforeEach(() => {
    fakeTask = { execute: jest.fn() } as ITask;
    fakeInput = {
      terminate: jest.fn().mockReturnValue(Promise.resolve())
    };
    console.info = jest.fn();
    fakePipe = [
      {
        load: jest.fn(),
        terminate: jest.fn().mockReturnValue(Promise.resolve())
      }
    ];

    fakeReqContext = {
      origin: 'origin'
    } as IRequestContext;
    fakeReqContext.pushExecutionContext = jest.fn();

    fakePayload = {
      context: fakeReqContext,
      data: {}
    } as Payload;

    fakeConfig = {
      fetch: jest.fn(),
      getValue: jest.fn().mockImplementation((key) => key),
      update: jest.fn(() => 'hola'),
      upsertValue: jest.fn(),
      getConsumerMap: jest.fn(),
      terminate: jest.fn().mockReturnValue(Promise.resolve())
    };
  });

  test('Instantiation', () => {
    const instance = new Service(new ServiceModel('name', 80, fakeConfig));
    expect(instance).toBeInstanceOf(Service);
  });

  test('addPipeline', () => {
    const instance = new Service(new ServiceModel('name', 80, fakeConfig));
    instance.addPipelines({} as IPipeline);
  });

  test('connect', async () => {
    const redisConn = 'redConString';
    const instance = new Service(new ServiceModel('name', 80, fakeConfig));
    (instance as any).webSocket = {
      adapter: jest.fn()
    };
    (instance as any)._configInput = {
      connect: jest.fn(),
      receiveMessage: jest.fn()
    };
    await (instance as any).connect();
    expect(fakeConfig.getValue).toBeCalledWith(redisConn);
  });

  test('connect with error', async () => {
    const redisConn = 'redConString';
    let errorThrown = false;
    fakeConfig.getValue = jest.fn().mockImplementation((x) => {
      throw new Error('Fake Error');
    });
    const instance = new Service(new ServiceModel('name', 80, fakeConfig));
    try {
      await (instance as any).connect();
    } catch (error) {
      errorThrown = true;
      expect(error.message).toBe(`Service name failed to connect with error: Error: Fake Error`);
    }
    expect(errorThrown).toBeTruthy();
  });

  test('start', async () => {
    const instance = new Service(new ServiceModel('name', 80, fakeConfig));
    (instance as any).connect = jest.fn();
    (instance as any)._httpServer.listen = jest.fn();
    (instance as any)._activePipelines = fakePipe;
    await instance.start();
    expect(fakePipe[0].load).toHaveBeenCalled();
  });

  test('start with task', async () => {
    const instance = new Service(new ServiceModel('name', 80, fakeConfig), fakeTask);
    (instance as any).connect = jest.fn();
    (instance as any)._httpServer.listen = jest.fn();
    (instance as any)._activePipelines = fakePipe;
    await instance.start();
    expect(fakeTask.execute).toBeCalledTimes(1);
  });

  test('start with error', async () => {
    const instance = new Service(new ServiceModel('name', 80, fakeConfig), fakeTask);
    (instance as any)._config.fetch = jest.fn().mockImplementation(() => {
      throw new Error('dudi');
    });

    await instance.start(3, 1);
    expect(console.error).toHaveBeenCalled();
  });

  test('start with error no mongo', async () => {
    fakeConfig.getValue = jest.fn().mockImplementation((key) => undefined);
    const instance = new Service(new ServiceModel('name', 80, fakeConfig));
    (instance as any).connect = jest.fn();
    (instance as any)._httpServer.listen = jest.fn();
    (instance as any)._activePipelines = fakePipe;
    await instance.start(1, 1);

    expect(console.error).toHaveBeenCalled();
  });

  test('start with error on task', async () => {
    let errorThrown = false;
    const fakeTask = {
      execute: jest.fn().mockImplementation(() => {
        throw new Error('fake');
      })
    } as ITask;
    const instance = new Service(new ServiceModel('name', 80, fakeConfig), fakeTask);
    try {
      await (instance as any).onLoad();
    } catch (error) {
      errorThrown = true;
      expect(error.message).toBe('Service name failed to load with error: Error: fake');
    }
    expect(errorThrown).toBeTruthy();
  });

  test('piplines', async () => {
    const pipelineNames = ['test', 'testtwo', 'outOfTest'];

    const instance = new Service(new ServiceModel('name', 80, fakeConfig));
    instance.addPipelines(fakePipe);

    expect(instance.pipelines.length).toBe(1);
  });

  test('listen', async () => {
    const instance = new Service(new ServiceModel('name', 80, fakeConfig));
    (instance as any)._listen();
    expect(console.info).toBeCalledTimes(2);
    expect(console.info).toBeCalledWith('Listening on: 80');
  });

  test('terminate successfully', async () => {
    const instance = new Service(new ServiceModel('name', 80, fakeConfig));
    (instance as any)._activePipelines = fakePipe;
    (instance as any)._configInput = fakeInput;

    const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number): never => code as never);

    await (instance as any).terminate();

    expect(console.info).toHaveBeenCalled();
    expect(fakePipe[0].terminate).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalled();
  });

  test('terminate with error', async () => {
    const instance = new Service(new ServiceModel('name', 80, fakeConfig));
    (instance as any)._pipelines = fakePipe;
    (instance as any)._configInput = fakeInput;

    const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number): never => code as never);

    fakePipe[0].terminate = jest.fn(() => {
      throw new Error('graceful pipeline termination failed');
    });

    await (instance as any).terminate();

    expect(fakePipe[0].terminate).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalled();
  });
});
