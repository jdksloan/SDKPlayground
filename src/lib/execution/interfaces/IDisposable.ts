export interface IDisposable {
  dispose(): Promise<void>;
  terminate(): Promise<void>;
}
