import { GraphNode } from "./GraphNode";
import { ID, Unsigned, Validate } from "./graphValidation";

interface INodeOptions {
	isDirected: boolean;
}

interface IWeight {
	weight: number;
}

export interface INeighbour extends IWeight {
	neighbourId: string;
}

export interface IEdge<T> extends IWeight {
	ownerNode: GraphNode<T>;
	neighbourNode: GraphNode<T>;
}

type IGraphCreate<T> = Record<string, [T, ...(string | INeighbour)[]]>;

export class Graph<T> {
	private readonly vertices: Map<string, GraphNode<T>>;
	private readonly edges: Map<string, IEdge<T>>;

	constructor(private readonly graphOptions: INodeOptions = { isDirected: true }) {
		this.vertices = new Map();
		this.edges = new Map();
	}

	public static create<T>(
		createConfig: IGraphCreate<T>,
		graphOptions: INodeOptions = { isDirected: true }
	): Graph<T> {
		const nodes = Object.entries(createConfig).map(([id, [value]]) => new GraphNode(id, value));
		const graph: Graph<T> = new Graph(graphOptions);
		graph.push(nodes);
		graph.vertices.forEach(({ id }) => {
			const [, ...neighbourIds] = createConfig[id]!;
			neighbourIds.forEach(neighbour => {
				if (typeof neighbour === "string") graph.connect(id, neighbour, 1);
				else graph.connect(id, neighbour.neighbourId, neighbour.weight);
			});
		});
		return graph;
	}

	public get ids(): string[] {
		const nodeIds: string[] = [];
		this.vertices.forEach(({ id }) => nodeIds.push(id));
		return nodeIds;
	}

	public add(node: GraphNode<T>): void {
		this.vertices.set(node.id, node);
	}

	public push(nodes: GraphNode<T>[]): void {
		nodes.forEach(node => this.add(node));
	}

	@Validate
	public get(@ID id: string): GraphNode<T> {
		const vertex = this.vertices.get(id);
		if (vertex !== undefined) return vertex;
		throw Error(`Graph does not contain a Node with ID = '${id}'`);
	}

	@Validate
	public hasNode(@ID id: string): boolean {
		return this.vertices.has(id);
	}

	@Validate
	public hasNeighbour(@ID nodeId: string, @ID neighbourId: string): boolean {
		return this.edges.has(`${nodeId}-${neighbourId}`);
	}

	@Validate
	public connect(@ID nodeId: string, @ID neighbourId: string, @Unsigned weight: number): void {
		if (this.hasNeighbour(nodeId, neighbourId)) return;
		const ownerNode = this.get(nodeId);
		const neighbourNode = this.get(neighbourId);
		this.edges.set(`${nodeId}-${neighbourId}`, { neighbourNode, ownerNode, weight });

		if (!this.graphOptions.isDirected) {
			if (this.hasNeighbour(neighbourId, nodeId)) return;
			this.edges.set(`${neighbourId}-${nodeId}`, {
				ownerNode: neighbourNode,
				neighbourNode: ownerNode,
				weight,
			});
		}
	}

	@Validate
	public BFS(@ID startNodeId: string): GraphNode<T>[] {
		const visitedNodes = new Map<string, boolean>();
		this.vertices.forEach(({ id }) => visitedNodes.set(id, false));
		visitedNodes.set(startNodeId, true);

		const nodeQueue: GraphNode<T>[] = [],
			BFSNodes: GraphNode<T>[] = [];
		nodeQueue.push(this.get(startNodeId));

		while (true) {
			const currentNode = nodeQueue.shift();
			if (currentNode === undefined) break;

			BFSNodes.push(currentNode);
			this.edges.forEach(({ ownerNode, neighbourNode }) => {
				if (ownerNode.id === currentNode.id && !visitedNodes.get(neighbourNode.id)) {
					visitedNodes.set(neighbourNode.id, true);
					nodeQueue.push(this.get(neighbourNode.id));
				}
			});
		}
		return BFSNodes;
	}

	@Validate
	public DFS(@ID startNodeId: string): GraphNode<T>[] {
		const visitedNodes = new Map<string, boolean>();
		this.vertices.forEach(({ id }) => visitedNodes.set(id, false));

		const nodeStack: GraphNode<T>[] = [],
			DFSNodes: GraphNode<T>[] = [];
		nodeStack.push(this.get(startNodeId));

		while (true) {
			const currentNode = nodeStack.pop();
			if (currentNode === undefined) break;

			if (visitedNodes.get(currentNode.id) === false) {
				visitedNodes.set(currentNode.id, true);
				DFSNodes.push(currentNode);
			}
			this.edges.forEach(({ ownerNode, neighbourNode }) => {
				if (ownerNode.id === currentNode.id && !visitedNodes.get(neighbourNode.id))
					nodeStack.push(neighbourNode);
			});
		}
		return DFSNodes;
	}

	@Validate
	public spanningTree(@ID startNodeId: string): Graph<T> {
		const graph = new Graph<T>(this.graphOptions);
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

	public log() {
		this.vertices.forEach(vertex => {
			console.log("Node :\t", vertex);
			console.log("Neighbours :");
			this.edges.forEach(({ ownerNode, neighbourNode }) => {
				if (ownerNode.id === vertex.id) console.log(neighbourNode);
			});
			console.log("\n\n");
		});
	}
}
