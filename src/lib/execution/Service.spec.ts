import { RedisRepository } from '../persistence/redis/RedisRepository';
import { MongoRepository } from '../persistence/mongodb/MongoRepository';
import { DefaultHealth } from './../health/DefaultHealth';
import { IReadyCheck } from './../health/interfaces/IReadyCheck';
import { SocketSingleton } from './../socket/SocketSingleton';
import { ConfigKey } from './../configuration/models/ConfigKey';
import { Payload } from './../messaging/models/Payload';
import { IPipeline } from './interfaces/IPipeline';
import { ITask } from './../task/interfaces/ITask';
import { Service } from './Service';
import { Server } from './Server';
import { IHealthCheck } from '../health/interfaces/IHeathCheck';
import { RedisFactory } from '../persistence/redis/RedisFactory';
import { ServiceModel } from './models/ServiceModel';
import { ElementsLogger } from '../logging/ElementsLogger';
import { IRequestContext } from '../context/interfaces/IRequestContext';
import redisAdapter from 'socket.io-redis';

jest.mock('../persistence/redis/RedisFactory');
jest.mock('socket.io-redis');

describe('Test Service', () => {
  let fakeHealth, fakeReady, fakeTask, fakeServer, fakeConfig, fakeRedisClient, fakePipe, fakePayload, fakeReqContext, fakeSocket, fakeInput;

  beforeEach(() => {
    fakeHealth = { checkHealth: jest.fn(), setHealth: jest.fn() } as IHealthCheck;
    fakeReady = {
      checkReady: jest.fn(),
      setReady: jest.fn((ready: boolean) => {
        return;
      })
    } as IReadyCheck;
    fakeTask = { execute: jest.fn() } as ITask;
    fakeServer = {} as Server;

    fakeInput = {
      terminate: jest.fn().mockReturnValue(Promise.resolve())
    };

    //redisAdapter.prototype = jest.fn().mockImplementation(() => {});

    fakeSocket = {
      adapter: jest.fn(),
      close: jest.fn()
    };
    fakeRedisClient = {
      on: jest.fn()
    };
    RedisFactory.createRedis = jest.fn().mockImplementation(() => fakeRedisClient);
    RedisFactory.splitConn = jest.fn().mockReturnValue({ host: 'host', port: 1234, password: '12345' });
    jest.mock('./Server', () => {
      return fakeServer;
    });

    ElementsLogger.defineLogger = jest.fn();

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

    ElementsLogger.info = jest.fn();
    ElementsLogger.error = jest.fn();
    fakeConfig = {
      fetch: jest.fn(),
      getValue: jest.fn().mockImplementation((key) => key),
      update: jest.fn(() => 'hola'),
      upsertValue: jest.fn(),
      getConsumerMap: jest.fn(),
      terminate: jest.fn().mockReturnValue(Promise.resolve())
    };

    jest.spyOn(SocketSingleton, 'Instance', 'get').mockReturnValue(fakeSocket);

    ElementsLogger.terminate = jest.fn().mockReturnValue(Promise.resolve());
    MongoRepository.terminate = jest.fn().mockReturnValue(Promise.resolve());
    RedisRepository.terminate = jest.fn().mockReturnValue(Promise.resolve());
  });

  test('Instantiation', () => {
    const instance = new Service(new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'), fakeHealth);
    expect(instance).toBeInstanceOf(Service);
  });

  test('addPipeline', () => {
    const instance = new Service(new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'), fakeHealth);
    instance.addPipelines({} as IPipeline);
  });

  test('connect', async () => {
    const redisConn = 'redConString';
    const instance = new Service(new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'), fakeHealth);
    (instance as any).webSocket = {
      adapter: jest.fn()
    };
    (instance as any)._configInput = {
      connect: jest.fn(),
      receiveMessage: jest.fn()
    };
    await (instance as any).connect();
    expect(fakeConfig.getValue).toBeCalledWith(redisConn);
    expect(RedisFactory.splitConn).toBeCalledTimes(1);
    expect(RedisFactory.splitConn).toBeCalledWith(redisConn);
  });

  test('connect with error', async () => {
    const redisConn = 'redConString';
    let errorThrown = false;
    fakeConfig.getValue = jest.fn().mockImplementation((x) => {
      throw new Error('Fake Error');
    });
    const instance = new Service(new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'), fakeHealth);
    try {
      await (instance as any).connect();
    } catch (error) {
      errorThrown = true;
      expect(error.message).toBe(`Service name failed to connect with error: Error: Fake Error`);
    }
    expect(errorThrown).toBeTruthy();
  });

  test('start', async () => {
    const instance = new Service(new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'), fakeHealth);
    (instance as any).connect = jest.fn();
    (instance as any)._httpServer.listen = jest.fn();
    (instance as any)._activePipelines = fakePipe;
    await instance.start();
    expect(ElementsLogger.defineLogger).toBeCalled();
    expect((instance as any)._httpServer.listen).toBeCalledTimes(1);
    expect(fakePipe[0].load).toHaveBeenCalled();
  });

  test('start with task', async () => {
    const instance = new Service(
      new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'),
      fakeHealth,
      fakeReady,
      undefined,
      fakeTask
    );
    (instance as any).connect = jest.fn();
    (instance as any)._httpServer.listen = jest.fn();
    (instance as any)._activePipelines = fakePipe;
    await instance.start();
    expect(fakeTask.execute).toBeCalledTimes(1);
  });

  test('start with error', async () => {
    const instance = new Service(
      new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'),
      fakeHealth,
      fakeReady,
      undefined,
      fakeTask
    );
    (instance as any)._config.fetch = jest.fn().mockImplementation(() => {
      throw new Error('dudi');
    });

    await instance.start(3, 1);
    expect(ElementsLogger.error).toHaveBeenCalled();
  });

  test('start with error no mongo', async () => {
    fakeConfig.getValue = jest.fn().mockImplementation((key) => undefined);
    const instance = new Service(new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'), fakeHealth);
    (instance as any).connect = jest.fn();
    (instance as any)._httpServer.listen = jest.fn();
    (instance as any)._activePipelines = fakePipe;
    await instance.start(1, 1);

    expect(ElementsLogger.error).toHaveBeenCalled();
  });

  test('start with error on task', async () => {
    let errorThrown = false;
    const crappyFakeTask = {
      execute: jest.fn().mockImplementation(() => {
        throw new Error('dudi');
      })
    } as ITask;
    const instance = new Service(
      new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'),
      fakeHealth,
      fakeReady,
      undefined,
      crappyFakeTask
    );
    try {
      await (instance as any).onLoad();
    } catch (error) {
      errorThrown = true;
      expect(error.message).toBe('Service name failed to load with error: Error: dudi');
    }
    expect(errorThrown).toBeTruthy();
  });

  test('handleNewConfig', async () => {
    fakePayload.data = {
      brokenTest: 'test',
      test: { value: 'test', service: 'test' } as ConfigKey
    };

    const instance = new Service(new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'), fakeHealth);
    (instance as any).upsertConfigs = jest.fn();
    (instance as any).reloadPipelines = jest.fn();

    await (instance as any).handleNewConfig(fakePayload);

    expect((instance as any).upsertConfigs).toBeCalledTimes(1);
    expect((instance as any).upsertConfigs).toBeCalledWith(fakePayload.data);
    expect((instance as any).reloadPipelines).toBeCalledTimes(1);
  });

  test('handleNewConfig no data', async () => {
    fakePayload.data = undefined;
    const instance = new Service(new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'));
    await (instance as any).handleNewConfig(fakePayload);
    expect(ElementsLogger.error).toBeCalled();
  });

  test('handleNewConfig wrong data', async () => {
    fakePayload.data = 'test';
    const instance = new Service(new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'));
    await (instance as any).handleNewConfig(fakePayload);
    expect(ElementsLogger.error).toBeCalled();
  });

  test('upsertConfigs', async () => {
    const newConfigs = {
      brokenTest: 'brokenTest',
      outOfTest: { value: 'outOfTest', service: 'out' } as ConfigKey,
      test: { value: 'test', service: 'name' } as ConfigKey,
      testtwo: { value: 'testtwo', service: 'Common' } as ConfigKey
    };
    const instance = new Service(new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'));
    await (instance as any).upsertConfigs(newConfigs);
    expect(fakeConfig.upsertValue).toBeCalledTimes(3);
    expect(fakeConfig.upsertValue).toBeCalledWith('test', 'test', 'name');
    expect(fakeConfig.upsertValue).toBeCalledWith('testtwo', 'testtwo', 'Common');
  });

  test('reloadPipelines', async () => {
    const pipelineNames = ['test', 'testtwo', 'outOfTest'];
    const fakePipes = [
      { pipelineName: 'test', load: jest.fn(), dispose: jest.fn() },
      { pipelineName: 'testtwo', load: jest.fn(), dispose: jest.fn() },
      { pipelineName: 'testthree', load: jest.fn(), dispose: jest.fn() }
    ];
    const instance = new Service(new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'), fakeHealth);
    (instance as any)._activePipelines = fakePipes;
    (instance as any)._storagePipelines = fakePipes;
    await (instance as any).reloadPipelines(pipelineNames);
  });

  test('reloadPipelines with error', async () => {
    const pipelineNames = ['test', 'testtwo', 'outOfTest'];
    const fakePipes = [
      { pipelineName: 'test', load: jest.fn(), dispose: jest.fn() },
      {
        pipelineName: 'testtwo',
        load: jest.fn(() => {
          throw new Error('pipelone load failed');
        }),
        dispose: jest.fn()
      },
      { pipelineName: 'testthree', load: jest.fn(), dispose: jest.fn() }
    ];

    const instance = new Service(new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'), new DefaultHealth());
    (instance as any)._activePipelines = fakePipes;
    (instance as any)._storagePipelines = fakePipes;
    try {
      await (instance as any).reloadPipelines(pipelineNames);
    } catch (err) {
      //tsling ignore.
    }
    expect((instance as any)._healthCheck.checkHealth()).toBeFalsy();
  });

  test('piplines', async () => {
    const pipelineNames = ['test', 'testtwo', 'outOfTest'];

    const instance = new Service(new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'), fakeHealth);
    instance.addPipelines(fakePipe);

    expect(instance.pipelines.length).toBe(1);
  });

  test('listen', async () => {
    const instance = new Service(new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'), fakeHealth);
    (instance as any)._listen();
    expect(ElementsLogger.info).toBeCalledTimes(2);
    expect(ElementsLogger.info).toBeCalledWith('Listening on: 80');
  });

  test('terminate successfully', async () => {
    const instance = new Service(
      new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'),
      fakeHealth,
      fakeReady
    );
    (instance as any)._activePipelines = fakePipe;
    (instance as any)._configInput = fakeInput;

    const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number): never => code as never);

    await (instance as any).terminate();

    expect(ElementsLogger.info).toHaveBeenCalled();
    expect(fakeReady.setReady).toHaveBeenCalledWith(false);
    expect(fakePipe[0].terminate).toHaveBeenCalled();
    expect(fakeSocket.close).toHaveBeenCalled();
    expect(ElementsLogger.terminate).toHaveBeenCalled();
    expect(MongoRepository.terminate).toHaveBeenCalled();
    expect(RedisRepository.terminate).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalled();
  });

  test('terminate with error', async () => {
    const instance = new Service(
      new ServiceModel('name', 80, fakeConfig, 'redConString', 'redChanKey', 'eventLogDbKey', 'eventConn', 'colKey', 'rabbitCon'),
      fakeHealth,
      fakeReady
    );
    (instance as any)._activePipelines = fakePipe;
    (instance as any)._configInput = fakeInput;

    const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number): never => code as never);

    fakePipe[0].terminate = jest.fn(() => {
      throw new Error('graceful pipeline termination failed');
    });

    await (instance as any).terminate();

    expect(ElementsLogger.info).toHaveBeenCalled();
    expect(ElementsLogger.error).toHaveBeenCalled();
    expect(fakeReady.setReady).toHaveBeenCalledWith(false);
    expect(fakePipe[0].terminate).toHaveBeenCalled();
    expect(fakeSocket.close).not.toHaveBeenCalled();
    expect(ElementsLogger.terminate).toHaveBeenCalled();
    expect(MongoRepository.terminate).toHaveBeenCalled();
    expect(RedisRepository.terminate).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalled();
  });
});
