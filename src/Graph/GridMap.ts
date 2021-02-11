import { Int, Unsigned, Validate } from "../assets";
import { Graph } from "./Graph";
import { GraphNode } from "./GraphNode";

export type gridPoint = `(${number}, ${number})`;
export type gridTranslation = "up" | "down" | "left" | "right";

export interface IVector2D {
	readonly x: number;
	readonly y: number;
}

export class Vector2D implements IVector2D {
	public readonly x: number;
	public readonly y: number;

	public constructor(...args: [IVector2D] | [number, number]) {
		const { x, y } = args.length === 1 ? args[0] : { x: args[0], y: args[1] };
		this.x = this.validateDirection(x);
		this.y = this.validateDirection(y);
	}

	@Validate
	private validateDirection(@Int dir: number): number {
		return dir;
	}

	public static translate({ x, y }: Vector2D, direction: gridTranslation): Vector2D {
		if (direction === "up") return new Vector2D(x - 1, y);
		if (direction === "down") return new Vector2D(x + 1, y);
		if (direction === "left") return new Vector2D(x, y - 1);
		if (direction === "right") return new Vector2D(x, y + 1);
		throw Error(" Invalid Direction Applied");
	}

	public static point({ x, y }: Vector2D): gridPoint {
		return `(${x}, ${y})` as gridPoint;
	}

	public static areEqual({ x: xA, y: yA }: Vector2D, { x: xB, y: yB }: Vector2D): boolean {
		return xA === xB && yA === yB;
	}
}

export interface IGridMap<T> {
	vector: Vector2D;
	attr: T;
}

export type GridMapNode<T> = GraphNode<IGridMap<T>>;

interface IGraphCreate<T> {
	grid: T[][];
	edges: { from: Vector2D; dir: gridTranslation; weight: number }[];
}

export type isGridNodeActiveFn<T> = (node: GridMapNode<T>) => boolean;
export type heuristicApproximations =
	| "manhattan"
	| "diagonal"
	| "euclidean"
	| ((vecA: Vector2D, vecB: Vector2D) => number);

export interface IAStarNode {
	f: number;
	g: number;
	parent: Vector2D;
}

export interface IAStarYield<T> {
	openNodes: Map<gridPoint, GridMapNode<T>>;
	gridCells: Map<gridPoint, IAStarNode>;
	currentNode: GridMapNode<T>;
}

export class GridMap<T> extends Graph<IGridMap<T>> {
	private readonly size: number;

	private constructor(size: number) {
		super();
		this.size = this.validateSize(size);
	}

	@Validate
	private validateSize(@Unsigned @Int size: number): number {
		return size;
	}

	private contains({ x, y }: Vector2D): boolean {
		return x >= 0 && x < this.size && y >= 0 && y < this.size;
	}

	public static createGrid<T>({ grid, edges }: IGraphCreate<T>): GridMap<T> {
		const graph = new GridMap<T>(grid.length);
		grid.forEach((row, x) => {
			if (row.length !== graph.size) throw Error("2D Grid should have equal rows and columns");
			row.forEach((attr, y) => {
				const vector = new Vector2D(x, y);
				graph.add(new GraphNode(Vector2D.point(vector), { vector, attr }));
			});
		});

		edges.forEach(({ from, dir, weight }) => {
			const to = Vector2D.translate(from, dir);
			if (!graph.contains(from) || !graph.contains(to))
				throw Error("Invalid Grid Vector Specified");
			graph.connect(Vector2D.point(from), Vector2D.point(to), weight);
		});

		const translations: gridTranslation[] = ["up", "down", "left", "right"];
		for (let x = 0; x < graph.size; ++x)
			for (let y = 0; y < graph.size; ++y)
				translations.forEach(translation => {
					const vector = new Vector2D(x, y);
					const translatedVector = Vector2D.translate(vector, translation);
					if (graph.contains(translatedVector))
						graph.connect(Vector2D.point(vector), Vector2D.point(translatedVector), 1);
				});

		return graph;
	}

	private tracePath(gridCells: Map<gridPoint, IAStarNode>, endNode: GridMapNode<T>): Vector2D[] {
		const path: Vector2D[] = [];
		let currentVector = endNode.value.vector;
		while (true) {
			path.push(new Vector2D(currentVector));
			const currentCell = gridCells.get(Vector2D.point(currentVector))!;

			if (Vector2D.areEqual(currentVector, currentCell.parent)) return path;
			currentVector = currentCell.parent;
		}
	}

	private heuristic(
		vectorA: Vector2D,
		vectorB: Vector2D,
		heurictic: heuristicApproximations
	): number {
		if (typeof heurictic !== "string") return heurictic(vectorA, vectorB);

		const xDiff = vectorA.x - vectorB.x,
			yDiff = vectorA.y - vectorB.y;
		switch (heurictic) {
			case "manhattan":
				return Math.abs(xDiff) + Math.abs(yDiff);
			case "diagonal":
				return Math.max(Math.abs(xDiff), Math.abs(yDiff));
			case "euclidean":
				return Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
		}
	}

	@Validate
	public *AStar(
		startNodeVec: Vector2D,
		endNodeVec: Vector2D,
		isActive: isGridNodeActiveFn<T>,
		heurictic: heuristicApproximations = "euclidean"
	): Generator<IAStarYield<T>, Vector2D[]> {
		const startPoint = Vector2D.point(startNodeVec),
			endPoint = Vector2D.point(endNodeVec);
		const startNode = this.get(startPoint),
			endNode = this.get(endPoint);

		const openNodes = new Map<gridPoint, GridMapNode<T>>(),
			gridCells = new Map<gridPoint, IAStarNode>();
		this.vertices.forEach(({ value: { vector } }) => {
			const point = Vector2D.point(vector);
			gridCells.set(point, {
				f: Infinity,
				g: Infinity,
				parent: new Vector2D(Infinity, Infinity),
			});
		});

		openNodes.set(startPoint, startNode);
		gridCells.set(startPoint, {
			g: 0,
			f: this.heuristic(startNodeVec, endNodeVec, heurictic),
			parent: startNodeVec,
		});

		while (openNodes.size > 0) {
			let currentNodeId: string | null = null,
				minFScore = Infinity;
			for (const [nodeId] of openNodes) {
				const nodeFScore = gridCells.get(nodeId)!.f;
				if (minFScore > nodeFScore) {
					currentNodeId = nodeId;
					minFScore = nodeFScore;
				}
			}

			if (currentNodeId === null) throw Error("F Scores determined to be Infinity");
			const currentPoint = currentNodeId as gridPoint;
			if (currentPoint === endPoint) return this.tracePath(gridCells, endNode);
			const currentNode = openNodes.get(currentPoint)!;
			openNodes.delete(currentPoint);

			for (const { neighbour, weight } of currentNode.each())
				if (isActive(neighbour)) {
					const neighbourPoint = Vector2D.point(neighbour.value.vector);
					const tentativeGScore = gridCells.get(currentPoint)!.g + weight;

					if (tentativeGScore < gridCells.get(neighbourPoint)!.g) {
						gridCells.set(neighbourPoint, {
							g: tentativeGScore,
							f: tentativeGScore + this.heuristic(neighbour.value.vector, endNodeVec, heurictic),
							parent: currentNode.value.vector,
						});
						if (!openNodes.has(neighbourPoint)) openNodes.set(neighbourPoint, neighbour);
					}
				}
			yield { openNodes, gridCells, currentNode };
		}
		throw Error("End Node is unreachable");
	}
}
