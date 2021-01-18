// import { LazyArray } from "./src/LazyArray";
// import sizeof from "object-sizeof";

// const arr = Array.from({ length: 10 }, (_, pos) => pos * 15);
// console.log("Array :\t", arr);

// console.time("Lazy Array");
// const lazyArray = LazyArray.create(arr)
// 	.map(({ val, pos }) => ({
// 		element: val,
// 		cos: Math.cos((Math.PI / 180) * val),
// 		str: pos.toString(),
// 	}))
// 	.filter(({ pos }) => pos % 2 === 0);
// console.log(lazyArray.debug(1));
// console.log(lazyArray.reduce(({ val, collected }) => collected + val.cos, { collected: 0 }));
// console.log(lazyArray.debug(2));
// const lazyArray1 = LazyArray.create(arr).roundWalk(7, 15);
// console.log(lazyArray1.debug(2));
// console.log(lazyArray1.roundWalk(2, 4).debug(2));
// console.timeEnd("Lazy Array");
// console.log("\n\n");
// console.log(sizeof(lazyArray));

// import { Graph, DirectedGraph } from "./src/Graph";

// let directedGraph = new DirectedGraph<null>();
// let graph = new Graph<null>();
// try {
// 	directedGraph = DirectedGraph.create<null>({
// 		A: [null, "B", { neighbourId: "E", weight: 8 }],
// 		B: [
// 			null,
// 			{ neighbourId: "A", weight: 2 },
// 			{ neighbourId: "C", weight: 3 },
// 			{ neighbourId: "D", weight: 4 },
// 			"E",
// 		],
// 		C: [null, { neighbourId: "B", weight: 2 }, { neighbourId: "D", weight: 3 }],
// 		D: [null, "B", { neighbourId: "C", weight: 2 }, { neighbourId: "D", weight: 5 }],
// 		E: [
// 			null,
// 			{ neighbourId: "A", weight: 2 },
// 			{ neighbourId: "B", weight: 2 },
// 			{ neighbourId: "D", weight: 2 },
// 		],
// 	});
// 	graph = Graph.make({
// 		vertices: {
// 			P: null,
// 			Q: null,
// 			R: null,
// 			S: null,
// 			T: null,
// 		},
// 		edges: [
// 			["P", "Q"],
// 			["P", "T", 8],
// 			["Q", "R", 3],
// 			["Q", "S", 4],
// 			["Q", "T"],
// 			["R", "S", 3],
// 			["S", "Q"],
// 			["S", "S", 5],
// 			["T", "S", 2],
// 		],
// 	});
// 	console.log("TRY BFS :\t", directedGraph.BFS("A"), "\n\n");
// 	console.log("TRY DFS :\t", directedGraph.DFS("A"), "\n\n");
// 	console.log(graph.spanningTree("P"));
// } catch (err) {
// 	console.error(err);
// } finally {
// 	console.log(directedGraph);
// 	console.log(graph);
// }

import { BPlusTree } from "./src/BPlusTree";

const treeOptions = {
	branchingFactor: 3,
	normalize: (x: number) => x,
};

const tree = new BPlusTree<number>(treeOptions);

tree.append(20);
tree.print();
console.log("(A)\n");

tree.append(30);
tree.print();
console.log("(A)\n");

tree.append(40);
tree.print();
console.log("(A)\n");

tree.append(50);
tree.print();
console.log("(A)\n");

tree.append(10);
tree.print();
console.log("(A)\n");

tree.append(0);
tree.print();
console.log("(A)\n");

tree.append(-10);
tree.print();
console.log("(A)\n");

tree.append(100);
tree.print();
console.log("(A)\n");

tree.append(0);
tree.print();
console.log("(A)\n");

tree.append(10);
tree.print();
console.log("(A)\n");

tree.append(20);
tree.print();
console.log("(A)\n");

tree.append(20);
tree.print();
console.log("(A)\n");
