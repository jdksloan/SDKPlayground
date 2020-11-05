import { Queue } from './Queue';
import { Node } from './Node';
import { IProcess } from './interfaces/IProcess';

export class Graph<T, V> {
  private _adjacencies: Map<T, Array<Node<T, V>>>;
  private _allowCyclic: boolean;

  private _nodes: Array<Node<T, V>>;

  constructor(allowCyclic: boolean = false) {
    this._adjacencies = new Map<T, Array<Node<T, V>>>();
    this._allowCyclic = allowCyclic;
    this._nodes = [];
  }

  public addNode(node: Node<T, V>) {
    this._adjacencies.set(node.id, []);
    this._nodes.push(node);
  }

  public addEdge(nodeA: Node<T, V>, nodeB: Node<T, V>) {
    if (!this._allowCyclic && nodeA.id === nodeB.id) {
      throw Error('Graph cannot be cyclical');
    }
    const a = this._adjacencies.get(nodeA.id);
    const b = this._adjacencies.get(nodeB.id);

    if (!a || !b) {
      throw new Error('One or both nodes not found');
    }

    a.push(nodeB);
    b.push(nodeA);
  }

  public printGraph() {
    let str = '';
    for (const [key, val] of this._adjacencies) {
      str += `${key} -> ${val.map((x) => x.id).join(', ')} `;
    }
  }

  public breadthFirstSearch(startNode: Node<T, V>, callBack?: IProcess<T, V>): Map<T, V> {
    const visitedNodes: Map<T, V> = new Map();

    const q = new Queue<Node<T, V>>();

    q.enqueue(startNode);
    while (!q.empty) {
      const node = q.dequeue();

      if (callBack && node) {
        const result = callBack.process(node);
        if (result) {
          break;
        }
      }

      if (node && !visitedNodes.get(node.id)) {
        const adja = this._adjacencies.get(node.id) || [];
        q.enqueue(...adja);
        visitedNodes.set(node.id, node.data);
      }
    }
    return visitedNodes;
  }

  public depthFirstSearch(startNode: Node<T, V>): Map<T, V> {
    const visitedNodes: Map<T, V> = new Map();

    this.dfsUtil(startNode, visitedNodes);

    return visitedNodes;
  }

  // Recursive function which process and explore
  // all the adjacent vertex of the vertex with which it is called
  private dfsUtil(vert: Node<T, V>, visitedNodes: Map<T, V>) {
    visitedNodes.set(vert.id, vert.data);

    const neighbours = this._adjacencies.get(vert.id) || [];

    for (const neighbour of neighbours) {
      if (!visitedNodes.get(neighbour.id)) {
        this.dfsUtil(neighbour, visitedNodes);
      }
    }
  }
}
