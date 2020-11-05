/**
 * Node reprensentation
 *
 * @export
 * @class Node
 * @template T node label
 * @template V node data
 */
export class Node<T, V> {
  public id: T;
  public data: V;
  public readonly label: string;

  /**
   * Creates an instance of Node.
   * @param {T} id
   * @param {V} data
   * @memberof Node
   */
  constructor(id: T, label: string, data: V) {
    this.id = id;
    this.label = label;
    this.data = data;
  }
}
