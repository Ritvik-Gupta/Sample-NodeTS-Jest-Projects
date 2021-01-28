import { Int, Unsigned, Validate } from "../assets";
import { BPlusNode, InternalNode, ISplitBranch, LeafNode } from "./BPlusNode";

export type comparePriorityFn<T> = (keyA: T, keyB: T) => "higher" | "lower" | "equal";

export interface IBPlusTreeEntry<T, U> {
	key: T;
	value: U;
}

export interface IBPlusTreeOptions {
	softUpdate: boolean;
}

export class BPlusTree<T, U> {
	private readonly branchingFactor: number;
	protected root: BPlusNode<T>;
	protected height: number;
	protected numEntries: number;

	public constructor(
		branchingFactor: number,
		protected readonly compare: comparePriorityFn<T>,
		private readonly options: IBPlusTreeOptions = { softUpdate: false }
	) {
		this.branchingFactor = this.validateBranchingFactor(branchingFactor);
		this.root = new LeafNode<T, U>();
		this.height = 1;
		this.numEntries = 0;
	}

	@Validate
	private validateBranchingFactor(@Unsigned @Int branchingFactor: number): number {
		return branchingFactor;
	}

	public clear(): void {
		this.root = new LeafNode<T, U>();
	}

	public get allowedMaxNodes(): number {
		return this.branchingFactor - 1;
	}

	public get allowedMinNodes(): number {
		return Math.ceil(this.branchingFactor / 2) - 1;
	}

	private insertHelper(node: BPlusNode<T>, key: T, value: U): ISplitBranch<T> | null {
		let insertPos = 0;
		for (; insertPos < node.numKeys; ++insertPos) {
			const priority = this.compare(key, node.key.get(insertPos));

			if (priority === "equal" && node instanceof LeafNode) {
				const treeNode = node as LeafNode<T, U>;
				if (this.options.softUpdate) {
					treeNode.setValue(insertPos, value);
					return null;
				} else throw Error("Duplicate Key found. Insertion Failed");
			} else if (priority === "lower") break;
		}

		if (node instanceof LeafNode) {
			const treeNode = node as LeafNode<T, U>;

			++this.numEntries;
			treeNode.key.insert(key, insertPos);
			treeNode.value.insert(value, insertPos);
		} else if (node instanceof InternalNode) {
			const treeNode = node as InternalNode<T, U>;

			const splitBranch = this.insertHelper(treeNode.branch.get(insertPos), key, value);
			if (splitBranch !== null) {
				treeNode.key.insert(splitBranch.key, insertPos);
				treeNode.branch.insert(splitBranch.node, insertPos + 1);
			}
		}

		if (node.numKeys > this.allowedMaxNodes) return node.split();
		else return null;
	}

	public insert({ key, value }: IBPlusTreeEntry<T, U>): void {
		const splitBranch = this.insertHelper(this.root, key, value);
		if (splitBranch !== null) {
			this.root = new InternalNode<T, U>(splitBranch.key, this.root, splitBranch.node);
			++this.height;
		}
	}

	private updateHelper(node: BPlusNode<T>, key: T, value: U): U {
		let updatePos = 0;
		for (; updatePos < node.numKeys; ++updatePos) {
			const priority = this.compare(key, node.key.get(updatePos));

			if (priority === "equal" && node instanceof LeafNode) {
				const treeNode = node as LeafNode<T, U>;
				const prevValue = treeNode.value.get(updatePos);
				treeNode.setValue(updatePos, value);
				return prevValue;
			} else if (priority === "lower") break;
		}

		if (node instanceof InternalNode) {
			const treeNode = node as InternalNode<T, U>;
			return this.updateHelper(treeNode.branch.get(updatePos), key, value);
		} else throw Error("Invalid Key. Not present in the Tree");
	}

	public update({ key, value }: IBPlusTreeEntry<T, U>): U {
		return this.updateHelper(this.root, key, value);
	}

	private searchHelper(node: BPlusNode<T>, key: T): U | null {
		if (node instanceof LeafNode) {
			const treeNode = node as LeafNode<T, U>;

			for (let searchPos = 0; searchPos < treeNode.numKeys; ++searchPos)
				if (this.compare(key, treeNode.key.get(searchPos)) === "equal")
					return treeNode.value.get(searchPos);
		} else if (node instanceof InternalNode) {
			const treeNode = node as InternalNode<T, U>;

			let searchPos = 0;
			for (; searchPos < treeNode.numKeys; ++searchPos)
				if (this.compare(key, treeNode.key.get(searchPos)) === "lower") break;
			return this.searchHelper(treeNode.branch.get(searchPos), key);
		}
		return null;
	}

	public search(key: T): U | null {
		return this.searchHelper(this.root, key);
	}

	private entriesHelper(node: BPlusNode<T>): IBPlusTreeEntry<T, U>[] {
		const entries: IBPlusTreeEntry<T, U>[] = [];
		if (node instanceof InternalNode) {
			const treeNode = node as InternalNode<T, U>;

			for (let pos = 0; pos < treeNode.numBranches; ++pos)
				entries.push(...this.entriesHelper(treeNode.branch.get(pos)));
		} else if (node instanceof LeafNode) {
			const treeNode = node as LeafNode<T, U>;

			for (let pos = 0; pos < treeNode.numKeys; ++pos)
				entries.push({ key: treeNode.key.get(pos), value: treeNode.value.get(pos) });
		}
		return entries;
	}

	public get entries(): IBPlusTreeEntry<T, U>[] {
		return this.entriesHelper(this.root);
	}
}
