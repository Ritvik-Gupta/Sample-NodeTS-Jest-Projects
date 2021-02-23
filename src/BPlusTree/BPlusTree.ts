import { Int, Unsigned, Validate } from "@/assets"
import { LinkedList } from "@/LinkedList"
import { BPlusNode, InternalNode, ISplitBranch, LeafNode } from "./BPlusNode"

export type priorityTypes = "higher" | "equal" | "lower"
export type comparePriorityFn<T> = (keyA: T, keyB: T) => priorityTypes

export interface IBPlusTreeEntry<T, U> {
	key: T
	value: U
}

export interface IBPlusTreeOptions {
	softUpdate: boolean
}

export class BPlusTree<T, U> {
	private readonly branchingFactor: number
	protected root: BPlusNode<T, U>
	protected height: number
	protected numEntries: number

	public constructor(
		branchingFactor: number,
		protected readonly compare: comparePriorityFn<T>,
		private readonly options: IBPlusTreeOptions = { softUpdate: false }
	) {
		this.branchingFactor = this.validateBranchingFactor(branchingFactor)
		this.root = new LeafNode<T, U>()
		this.height = 1
		this.numEntries = 0
	}

	@Validate
	private validateBranchingFactor(@Unsigned @Int branchingFactor: number): number {
		return branchingFactor
	}

	public clear(): void {
		this.root = new LeafNode<T, U>()
	}

	public get allowedMaxNodes(): number {
		return this.branchingFactor - 1
	}

	public get allowedMinNodes(): number {
		return Math.ceil(this.branchingFactor / 2) - 1
	}

	private insertHelper(node: BPlusNode<T, U>, key: T, value: U): ISplitBranch<T, U> | null {
		let insertPos = 0
		for (; insertPos < node.numKeys; ++insertPos) {
			const priority = this.compare(key, node.key.get(insertPos))

			if (priority === "equal" && node instanceof LeafNode) {
				const treeNode = node as LeafNode<T, U>
				if (this.options.softUpdate) {
					treeNode.setValue(insertPos, value)
					return null
				} else throw Error("Duplicate Key found. Insertion Failed")
			} else if (priority === "lower") break
		}

		switch (true) {
			case node instanceof InternalNode: {
				const treeNode = node as InternalNode<T, U>
				const splitBranch = this.insertHelper(treeNode.branch.get(insertPos), key, value)
				if (splitBranch !== null) {
					treeNode.key.insert(splitBranch.key, insertPos)
					treeNode.branch.insert(splitBranch.node, insertPos + 1)
				}
				break
			}
			case node instanceof LeafNode: {
				const treeNode = node as LeafNode<T, U>
				++this.numEntries
				treeNode.key.insert(key, insertPos)
				treeNode.value.insert(value, insertPos)
				break
			}
		}

		if (node.numKeys > this.allowedMaxNodes) return node.split()
		else return null
	}

	public insert({ key, value }: IBPlusTreeEntry<T, U>): void {
		const splitBranch = this.insertHelper(this.root, key, value)
		if (splitBranch !== null) {
			this.root = new InternalNode<T, U>(splitBranch.key, this.root, splitBranch.node)
			++this.height
		}
	}

	private updateHelper(node: BPlusNode<T, U>, key: T, value: U): U {
		let updatePos = 0
		for (; updatePos < node.numKeys; ++updatePos) {
			const priority = this.compare(key, node.key.get(updatePos))

			if (priority === "equal" && node instanceof LeafNode) {
				const treeNode = node as LeafNode<T, U>
				const prevValue = treeNode.value.get(updatePos)
				treeNode.setValue(updatePos, value)
				return prevValue
			} else if (priority === "lower") break
		}

		switch (true) {
			case node instanceof InternalNode: {
				const treeNode = node as InternalNode<T, U>
				return this.updateHelper(treeNode.branch.get(updatePos), key, value)
			}
			default:
				throw Error("Invalid Key, not present in the Tree")
		}
	}

	public update({ key, value }: IBPlusTreeEntry<T, U>): U {
		return this.updateHelper(this.root, key, value)
	}

	private searchHelper(node: BPlusNode<T, U>, key: T): U | null {
		switch (true) {
			case node instanceof InternalNode: {
				const treeNode = node as InternalNode<T, U>
				let searchPos = 0
				for (; searchPos < treeNode.numKeys; ++searchPos)
					if (this.compare(key, treeNode.key.get(searchPos)) === "lower") break
				return this.searchHelper(treeNode.branch.get(searchPos), key)
			}
			case node instanceof LeafNode: {
				const treeNode = node as LeafNode<T, U>
				for (let searchPos = 0; searchPos < treeNode.numKeys; ++searchPos)
					if (this.compare(key, treeNode.key.get(searchPos)) === "equal")
						return treeNode.value.get(searchPos)
			}
		}
		return null
	}

	public search(key: T): U | null {
		return this.searchHelper(this.root, key)
	}

	public get entries(): IBPlusTreeEntry<T, U>[] {
		const entries: IBPlusTreeEntry<T, U>[] = []
		const entryQueue = new LinkedList("queue", [this.root])

		while (entryQueue.length > 0) {
			const node = entryQueue.delete()
			switch (true) {
				case node instanceof InternalNode: {
					const treeNode = node as InternalNode<T, U>
					treeNode.branch.forEach(branch => entryQueue.insert(branch))
					break
				}
				case node instanceof LeafNode: {
					const treeNode = node as LeafNode<T, U>
					for (let pos = 0; pos < treeNode.numKeys; ++pos)
						entries.push({ key: treeNode.key.get(pos), value: treeNode.value.get(pos) })
					break
				}
			}
		}
		return entries
	}
}
