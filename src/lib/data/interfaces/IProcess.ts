import { Node } from '../Node';

export interface IProcess<T, V> {
  process(node: Node<T, V>): boolean;
}
