import { DirectedGraph, IEdge } from "./DirectedGraph";
import { GraphNode } from "./GraphNode";
import { ID, Unsigned, Validate } from "./graphValidation";

interface IGraphCreate<T> {
	vertices: Record<string, T>;
	edges: [string, string, number?][];
}

export class Graph<T> extends DirectedGraph<T> {
	constructor() {
		super();
	}

	public static make<T>({ vertices, edges }: IGraphCreate<T>): Graph<T> {
		const graph = new Graph<T>();
		const nodes = Object.entries(vertices).map(([id, value]) => new GraphNode(id, value));
		graph.push(nodes);
		edges.forEach(([ownerId, neighbourId, weight]) => {
			graph.connect(ownerId, neighbourId, weight ?? 1);
		});
		return graph;
	}

	@Validate
	public connect(@ID ownerId: string, @ID neighbourId: string, @Unsigned weight: number): void {
		if (this.hasNeighbour(ownerId, neighbourId)) return;
		const ownerNode = this.get(ownerId);
		const neighbourNode = this.get(neighbourId);
		this.edges.set(`${ownerId}-${neighbourId}`, { neighbourNode, ownerNode, weight });
		this.edges.set(`${neighbourId}-${ownerId}`, {
			neighbourNode: ownerNode,
			ownerNode: neighbourNode,
			weight,
		});
	}

	@Validate
	public spanningTree(@ID startNodeId: string): Graph<T> {
		const graph = new Graph<T>();
		const visitedNodes = new Map<string, boolean>();
		this.vertices.forEach(node => {
			visitedNodes.set(node.id, false);
			graph.add(node);
		});

		let collectedNeighbours: IEdge<T>[] = [];
		let currentNode = this.get(startNodeId);
		do {
			visitedNodes.set(currentNode.id, true);
			this.edges.forEach(edge => {
				if (edge.ownerNode.id === currentNode.id && !visitedNodes.get(edge.neighbourNode.id))
					collectedNeighbours.push(edge);
			});

			const {
				ownerNode,
				neighbourNode,
				weight,
			} = collectedNeighbours.reduce((minEdge, currentEdge) =>
				minEdge.weight >= currentEdge.weight ? currentEdge : minEdge
			);
			collectedNeighbours = collectedNeighbours.filter(
				({ neighbourNode: { id } }) => id !== neighbourNode.id
			);

			graph.connect(ownerNode.id, neighbourNode.id, weight);
			currentNode = neighbourNode;
		} while (collectedNeighbours.length > 0);
		return graph;
	}
}
