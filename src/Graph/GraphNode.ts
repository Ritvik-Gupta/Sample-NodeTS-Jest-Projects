import { createParamDecorator, Int, Unsigned, Validate } from "@/assets"

export const ID = createParamDecorator(param => ({
	validate: typeof param === "string" && GraphNode.validate(param),
	error: Error(`Node with ID = '${param}' not Initialized`),
}))

export interface IWeight {
	weight: number
}

export interface IEdge<T> extends IWeight {
	neighbour: GraphNode<T>
}

export class GraphNode<T> {
	private static readonly createdNodeIds: string[] = []

	private readonly neighbours: Map<string, IEdge<T>>

	public constructor(public readonly id: string, public readonly value: T) {
		if (GraphNode.validate(id) === false) GraphNode.createdNodeIds.push(id)
		this.neighbours = new Map()
	}

	public static validate(id: string): boolean {
		return GraphNode.createdNodeIds.includes(id)
	}

	public *each() {
		for (const [, neighbour] of this.neighbours) yield neighbour
	}

	@Validate
	public add(neighbour: GraphNode<T>, @Unsigned @Int weight: number): void {
		this.neighbours.set(neighbour.id, { neighbour, weight })
	}

	@Validate
	public has(@ID neighbourId: string): boolean {
		return this.neighbours.has(neighbourId)
	}

	public log(): void {
		console.log("Node :\t", this.id)
		console.log("Value :\t", this.value)
		console.log("Neighbours :")
		this.neighbours.forEach(({ neighbour, weight }) => {
			console.log("\tNeighbour ID :\t", neighbour.id)
			console.log("\tWeight :\t", weight)
		})
	}
}
