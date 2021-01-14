import { immerable, produce } from "immer";

export interface IGraphNode<T> {
	readonly id: string;
	readonly value: T;
}

export class GraphNode<T> implements IGraphNode<T> {
	readonly [immerable] = true;
	private static readonly createdNodeIds: string[] = [];

	public constructor(public readonly id: string, private readonly val: T) {
		if (GraphNode.validate(id) === true) throw Error(`Duplicate Id = '${id}' found for Nodes`);
		GraphNode.createdNodeIds.push(id);
	}

	public static validate(id: string): boolean {
		return GraphNode.createdNodeIds.includes(id);
	}

	public get value(): T {
		return produce(this.val, () => {});
	}
}
