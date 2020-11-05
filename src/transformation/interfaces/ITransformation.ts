export interface ITransformation<T> {
  transform(result: T): any;
}
