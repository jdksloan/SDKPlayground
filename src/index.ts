import { IProcess, Node, Graph } from 'ts-graph-structure';
import { JsonParser } from 'ts-neo4j-parser';

const process: IProcess<number, number> = {
  process(node: Node<number, number>): boolean {
    if (node.id === 6) {
      return true;
    }
    return false;
  }
};

const instance = new Graph<number, number>();
const node0 = new Node(0, 'Number', 10);
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

const result = instance.breadthFirstSearch(node0);
const result1 = instance.breadthFirstSearch(node0, process);
const result2 = instance.depthFirstSearch(node0);

console.info(result);
console.info(result1);
console.info(result2);
console.info(instance.printGraph());
