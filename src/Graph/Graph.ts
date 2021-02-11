import { Int, Unsigned, Validate } from "../assets";
import { DirectedGraph } from "./DirectedGraph";
import { GraphNode, ID, IWeight } from "./GraphNode";

export interface ISpanEdge<T> extends IWeight {
	owner: GraphNode<T>;
	neighbour: GraphNode<T>;
}

export type heuristicFn<T> = (start: GraphNode<T>, end: GraphNode<T>) => number;
interface IGraphCreate<T> {
	vertices: Record<string, T>;
	edges: [string, string, number?][];
}

export class Graph<T> extends DirectedGraph<T> {
	public static createUndirected<T>({ vertices, edges }: IGraphCreate<T>): Graph<T> {
		const graph = new Graph<T>();
		const nodes = Object.entries(vertices).map(([id, value]) => new GraphNode(id, value));
		graph.push(nodes);
		edges.forEach(([nodeId, neighbourId, weight]) => {
			graph.connect(nodeId, neighbourId, weight ?? 1);
		});
		return graph;
	}

	@Validate
	public connect(@ID nodeId: string, @ID neighbourId: string, @Unsigned @Int weight: number): void {
		const node = this.get(nodeId);
		const neighbour = this.get(neighbourId);
		if (node.has(neighbourId) === false) node.add(neighbour, weight);
		if (neighbour.has(nodeId) === false) neighbour.add(node, weight);
	}

	@Validate
	public MST(@ID startNodeId: string): Graph<T> {
		const graph = new Graph<T>();
		const visitedNodes = new Map<string, boolean>(),
			vertexKeys = new Map<string, number>(),
			parentNodes = new Map<string, string | null>();

		this.vertices.forEach(({ id, value }) => {
			visitedNodes.set(id, false);
			vertexKeys.set(id, Infinity);
			parentNodes.set(id, null);
			graph.add(new GraphNode(id, value));
		});

		vertexKeys.set(startNodeId, 0);
		for (let count = 0; count < this.vertices.size - 1; ++count) {
			let minVertexId: string | null = null,
				minVertexKey = Infinity;

			for (const [nodeId, nodeKey] of vertexKeys)
				if (visitedNodes.get(nodeId)! === false && nodeKey < minVertexKey) {
					minVertexKey = nodeKey;
					minVertexId = nodeId;
				}
			if (minVertexId === null) break;
			const minVertex = this.get(minVertexId);
			visitedNodes.set(minVertex.id, true);

			for (const { neighbour, weight } of minVertex.each())
				if (!visitedNodes.get(neighbour.id)! && vertexKeys.get(neighbour.id)! > weight) {
					parentNodes.set(neighbour.id, minVertex.id);
					vertexKeys.set(neighbour.id, weight);
				}
		}

		parentNodes.forEach((nodeId, neighbourId) => {
			if (nodeId !== null) graph.connect(nodeId, neighbourId, vertexKeys.get(neighbourId)!);
		});
		return graph;
	}
}
