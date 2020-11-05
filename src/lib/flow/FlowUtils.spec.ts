import { FlowUtils } from './FlowUtils';

describe('Test FlowUtils', () => {
  beforeEach(() => {
    (FlowUtils.sleep as any) = jest.fn().mockImplementation(() => true);
  });

  test('sleep 1 ms', () => {
    FlowUtils.sleep(1);
    expect(FlowUtils.sleep).toHaveBeenCalledTimes(1);
  });
});
