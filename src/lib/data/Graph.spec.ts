import { IProcess } from './interfaces/IProcess';
import { Graph } from './Graph';
import { Node } from './Node';
describe('Test Pipeline', () => {
  let process: IProcess<number, number>, instance: Graph<number, number>, node0: Node<number, number>;
  beforeEach(() => {
    process = {
      process(node: Node<number, number>): boolean {
        if (node.id === 6) {
          return true;
        }
        return false;
      }
    };
    instance = new Graph<number, number>();
    node0 = new Node(0, 'Number', 10);
    const node1 = new Node(1, 'Number', 99);
    const node2 = new Node(2, 'Number', 3);
    const node3 = new Node(3, 'Number', 19);
    const node4 = new Node(4, 'Number', -20);
    const node5 = new Node(5, 'Number', 33);
    const node6 = new Node(6, 'Number', 3663);
    const node7 = new Node(7, 'Number', 3663);
    const node8 = new Node(8, 'Number', 3663);
    const node9 = new Node(9, 'Number', 3663);
    instance.addNode(node0);
    instance.addNode(node1);
    instance.addNode(node2);
    instance.addNode(node3);
    instance.addNode(node4);
    instance.addNode(node5);
    instance.addNode(node6);
    instance.addNode(node7);
    instance.addNode(node8);
    instance.addNode(node9);
    instance.addEdge(node0, node1);
    instance.addEdge(node0, node2);
    instance.addEdge(node2, node6);
    instance.addEdge(node1, node3);
    instance.addEdge(node1, node4);
    instance.addEdge(node1, node5);
    instance.addEdge(node3, node7);
    instance.addEdge(node4, node8);
    instance.addEdge(node4, node9);
  });

  test('Instantiation', () => {
    const instance = new Graph();
    expect(instance).toBeInstanceOf(Graph);
    expect(instance).not.toBeUndefined();
  });

  test('Print graph', () => {
    instance.printGraph();
  });

  test('Number graph breadthFirstSearch', () => {
    const result = instance.breadthFirstSearch(node0);
    const js = JSON.stringify(Array.from(result.keys()));
    expect(js).toEqual('[0,1,2,3,4,5,6,7,8,9]');
  });

  test('Number graph breadthFirstSearch with process', () => {
    const result = instance.breadthFirstSearch(node0, process);
    const js = JSON.stringify(Array.from(result.keys()));
    expect(js).toEqual('[0,1,2,3,4,5]');
  });

  test('Number graph depthFirstSearch', () => {
    const result = instance.depthFirstSearch(node0);
    const js = JSON.stringify(Array.from(result.keys()));
    expect(js).toEqual('[0,1,3,7,4,8,9,5,2,6]');
  });

  test('Add edge failed cant find node(s)', () => {
    const instance = new Graph<number, number>();
    const node0 = new Node(0, 'Number', 10);
    const node1 = new Node(1, 'Number', 99);
    instance.addNode(node0);
    instance.addNode(node1);

    try {
      instance.addEdge(new Node(2, 'Number', 3), node1);
    } catch (error) {
      expect(error.message).toBe('One or both nodes not found');
    }
  });

  test('Add edge failed cant be cyclical', () => {
    const instance = new Graph<number, number>();
    const node0 = new Node(0, 'Number', 10);
    instance.addNode(node0);

    try {
      instance.addEdge(node0, node0);
    } catch (error) {
      expect(error.message).toBe('Graph cannot be cyclical');
    }
  });
});
