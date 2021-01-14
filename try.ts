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

import { Graph } from "./src/Graph";

let graph: Graph<null> = new Graph();
try {
	graph = Graph.create<null>(
		{
			A: [null, "B", { neighbourId: "E", weight: 8 }],
			B: [
				null,
				{ neighbourId: "A", weight: 2 },
				{ neighbourId: "C", weight: 3 },
				{ neighbourId: "D", weight: 4 },
				"E",
			],
			C: [null, { neighbourId: "B", weight: 2 }, { neighbourId: "D", weight: 3 }],
			D: [null, "B", { neighbourId: "C", weight: 2 }, { neighbourId: "D", weight: 5 }],
			E: [
				null,
				{ neighbourId: "A", weight: 2 },
				{ neighbourId: "B", weight: 2 },
				{ neighbourId: "D", weight: 2 },
			],
		},
		{ isDirected: false }
	);
	console.log("TRY BFS :\t", graph.BFS("A"), "\n\n");
	console.log("TRY DFS :\t", graph.DFS("A"), "\n\n");
	console.log(graph.spanningTree("A"));
} catch (err) {
	console.error(err);
} finally {
	console.log(graph);
}
