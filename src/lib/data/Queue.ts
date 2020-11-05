export class Queue<T> {
  private _store: T[] = [];

  public enqueue(...val: T[]) {
    this._store.push(...val);
  }
  public dequeue(): T | undefined {
    return this._store.shift();
  }

  public get empty(): boolean {
    return this._store.length === 0;
  }
}
