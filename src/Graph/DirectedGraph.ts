import { Int, Unsigned, Validate } from "../assets";
import { GraphNode, ID, IWeight } from "./GraphNode";

export interface INeighbour extends IWeight {
	neighbourId: string;
}

type IGraphCreate<T> = Record<string, [T, ...(string | INeighbour)[]]>;

export class DirectedGraph<T> {
	protected readonly vertices: Map<string, GraphNode<T>>;

	constructor() {
		this.vertices = new Map();
	}

	public static createDirected<T>(createConfig: IGraphCreate<T>): DirectedGraph<T> {
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
	public connect(@ID nodeId: string, @ID neighbourId: string, @Unsigned @Int weight: number): void {
		const node = this.get(nodeId);
		if (node.has(neighbourId) === false) node.add(this.get(neighbourId), weight);
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
			for (const { neighbour } of currentNode.each())
				if (!visitedNodes.get(neighbour.id)) {
					visitedNodes.set(neighbour.id, true);
					nodeQueue.push(this.get(neighbour.id));
				}
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
			for (const { neighbour } of currentNode.each())
				if (!visitedNodes.get(neighbour.id)) nodeStack.push(neighbour);
		}
		return DFSNodes;
	}

	public log() {
		this.vertices.forEach(vertex => {
			vertex.log();
			console.log("\n");
		});
	}
}
