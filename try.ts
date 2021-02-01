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

const tree = new BPlusTree<number, number>(
	5,
	(a, b) => (a < b ? "lower" : a > b ? "higher" : "equal"),
	{ softUpdate: true }
);

const arr: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

arr.forEach(key => tree.insert({ key, value: key * 10 }));
console.log(JSON.stringify(tree, null, "<\t"));
tree.entries.forEach(({ key }) => console.log(tree.search(key)));
