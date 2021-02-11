import { GridMap, Vector2D } from "./src/Graph";

try {
	// const directedGraph = DirectedGraph.create<null>({
	// 	A: [null, "B", { neighbourId: "E", weight: 8 }],
	// 	B: [
	// 		null,
	// 		{ neighbourId: "A", weight: 2 },
	// 		{ neighbourId: "C", weight: 3 },
	// 		{ neighbourId: "D", weight: 4 },
	// 		"E",
	// 	],
	// 	C: [null, { neighbourId: "B", weight: 2 }, { neighbourId: "D", weight: 3 }],
	// 	D: [null, "B", { neighbourId: "C", weight: 2 }, { neighbourId: "D", weight: 5 }],
	// 	E: [
	// 		null,
	// 		{ neighbourId: "A", weight: 2 },
	// 		{ neighbourId: "B", weight: 2 },
	// 		{ neighbourId: "D", weight: 2 },
	// 	],
	// })
	//
	// console.log("TRY BFS :\t", directedGraph.BFS("A"), "\n\n")
	// console.log("TRY DFS :\t", directedGraph.DFS("A"), "\n\n")

	enum GridCellTypes {
		B = "block",
		L = "land",
	}
	const { B: Q, L: _ } = GridCellTypes;

	const graph = GridMap.createGrid<GridCellTypes>({
		grid: [
			[_, _, _, _, _, _, _],
			[_, Q, Q, Q, Q, Q, _],
			[_, Q, _, _, _, Q, _],
			[_, Q, _, Q, _, Q, _],
			[_, Q, _, Q, _, Q, _],
			[_, Q, _, Q, _, Q, _],
			[_, _, _, Q, _, _, _],
		],
		edges: [{ from: new Vector2D(0, 0), dir: "right", weight: Infinity }],
	});

	console.time("A* Algo");
	const aStarItr = graph.AStar(
		new Vector2D(0, 0),
		new Vector2D(0, 2),
		node => node.value.attr === GridCellTypes.L,
		() => 0
	);
	let current = aStarItr.next();
	while (!current.done!) {
		if (!Array.isArray(current.value)) {
			console.log("Current Node :\t", current.value.currentNode.value);
			console.log("Open Set :\n", current.value.openNodes);
			console.log("\n\n");
		}
		current = aStarItr.next();
	}
	console.log(current.value);
	console.log("\n\n");
	console.timeEnd("A* Algo");
	console.log("\n\n");
} catch (err) {
	console.error(err);
}

// import { BPlusTree } from "./src/BPlusTree"
// const tree = new BPlusTree<number, number>(5, () => "higher", { softUpdate: true })
// const arr: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
// arr.forEach(key => tree.insert({ key, value: key * 10 }))
// console.log(JSON.stringify(tree, null, "<\t"))
// tree.entries.forEach(({ key }) => console.log(tree.search(key)))
// import { SortedList } from "./src/SortedList"
// const list = new SortedList<[number]>(a => a[0])
// try {
// 	list.pop()
// } catch (e) {
// 	console.log(e)
// }
// for (let i = 0; i < 20; ++i) {
// 	list.push([Math.floor(Math.random() * 100)])
// 	console.log(list.map(val => val))
// }
// console.log(list.pop())

// const arr: [number, string, boolean] = [12, "ksn", true];
// console.log(
// 	ANY<[number, string, boolean]>(
// 		[OR(13, 12), "cksnv", true],
// 		[12, OR("cks", "kcs"), OR<boolean>(false)]
// 	)(arr)
// );

// const list = new LinkedList("stack", [10, 15]);

// list.insert(100);
// console.log(list.delete());
// list.insert(101);
// list.insert(102);
// list.insert(103);
// console.log(list.delete("front"));
// list.insert(104);
// list.insert(105);
// console.log(list.delete());
// console.log(list.length);
// for (const elm of list.each()) console.log(elm);
