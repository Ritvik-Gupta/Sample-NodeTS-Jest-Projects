import { Int, Unsigned, Validate } from "../assets";
import { GraphNode, ID } from "./GraphNode";

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

export class DirectedGraph<T> {
	protected readonly vertices: Map<string, GraphNode<T>>;
	protected readonly edges: Map<string, IEdge<T>>;

	constructor() {
		this.vertices = new Map();
		this.edges = new Map();
	}

	public static create<T>(createConfig: IGraphCreate<T>): DirectedGraph<T> {
		const graph = new DirectedGraph<T>();
		const nodes = Object.entries(createConfig).map(([id, [value]]) => new GraphNode(id, value));
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
	public hasNeighbour(@ID ownerId: string, @ID neighbourId: string): boolean {
		return this.edges.has(`${ownerId}-${neighbourId}`);
	}

	@Validate
	public connect(
		@ID ownerId: string,
		@ID neighbourId: string,
		@Unsigned @Int weight: number
	): void {
		if (this.hasNeighbour(ownerId, neighbourId)) return;
		const ownerNode = this.get(ownerId);
		const neighbourNode = this.get(neighbourId);
		this.edges.set(`${ownerId}-${neighbourId}`, { neighbourNode, ownerNode, weight });
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
