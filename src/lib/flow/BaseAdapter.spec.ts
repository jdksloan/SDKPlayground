import { IConfiguration } from './../configuration/interfaces/IConfiguration';
import { Pipeline } from './../execution/Pipeline';
import { BaseAdapter } from './BaseAdapter';

class MockAdapter extends BaseAdapter<any> {
  public dispose = jest.fn();
}

describe('Test BaseAdapter', () => {
  let baseAdapterMock: BaseAdapter<any>, pipelineMock: Pipeline<any>, configurationMock: IConfiguration;

  beforeEach(() => {
    baseAdapterMock = new MockAdapter({});
    pipelineMock = jest.genMockFromModule<Pipeline<any>>('./../execution/Pipeline');
    configurationMock = jest.genMockFromModule<IConfiguration>('./../configuration/interfaces/IConfiguration');
  });

  test('get pipeline', () => {
    let error = undefined;

    (baseAdapterMock as any)._pipeline = pipelineMock;
    let pipeline = undefined;

    try {
      pipeline = (baseAdapterMock as any).pipeline;
    } catch (err) {
      error = err;
    }

    expect(error).toBeUndefined();
    expect((baseAdapterMock as any).pipeline).toBeDefined();
  });

  test('get pipeline not found', () => {
    let error = undefined;
    let pipeline = undefined;

    try {
      pipeline = (baseAdapterMock as any).pipeline;
    } catch (err) {
      error = err;
    }

    expect(pipeline).toBeUndefined();
  });

  test('get configuration', () => {
    let error = undefined;

    (baseAdapterMock as any)._config = configurationMock;
    let configuration = undefined;

    try {
      configuration = (baseAdapterMock as any).config;
    } catch (err) {
      error = err;
    }

    expect(error).toBeUndefined();
    expect((baseAdapterMock as any).config).toBeDefined();
  });

  test('get configuration not found', () => {
    let error = undefined;
    let configuration = undefined;

    try {
      configuration = (baseAdapterMock as any).config;
    } catch (err) {
      error = err;
    }

    expect(configuration).toBeUndefined();
  });

  test('releasePipeline', () => {
    let releasePipeline: () => void = (baseAdapterMock as any).releasePipeline;
    (baseAdapterMock as any)._pipeline = pipelineMock;
    expect((baseAdapterMock as any).pipeline).toBeDefined();

    releasePipeline = releasePipeline.bind(baseAdapterMock);
    releasePipeline();

    expect((baseAdapterMock as any)._pipeline).toBeUndefined();
  });

  test('attach', () => {
    baseAdapterMock.attach(configurationMock, pipelineMock);

    expect((baseAdapterMock as any)._pipeline).toBeDefined();
    expect((baseAdapterMock as any)._config).toBeDefined();
  });

  test('attach', () => {
    const schema = baseAdapterMock.getSchema();
  });

  test('terminate', () => {
    const schema = baseAdapterMock.terminate();
    expect(baseAdapterMock.dispose).toHaveBeenCalled();
  });
});
