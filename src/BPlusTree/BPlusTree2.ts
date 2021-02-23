import { Int, Unsigned, Validate } from "@/assets"

export abstract class BPlusNode<T, U> {
	protected readonly __generic__: U | null = null
	public abstract next: BPlusNode<T, U> | null

	public constructor(public readonly key: T) {}
}

export abstract class BPlusNodeList<T, U> {
	protected readonly __generic__: U | null = null
	protected abstract head: BPlusNode<T, U> | null
	public size: number

	public constructor() {
		this.size = 1
	}

	public get keyTraversal(): T[] {
		const nodeKeys: T[] = []
		let currentNode: BPlusNode<T, U> | null = this.head
		while (currentNode !== null) {
			nodeKeys.push(currentNode.key)
			currentNode = currentNode.next
		}
		return nodeKeys
	}

	@Validate
	protected insertCheck(@Unsigned @Int insertPos: number): void {
		if (insertPos < 0 || insertPos > this.size)
			throw RangeError("Invalid Index Position for B+ List")
		++this.size
	}

	public abstract forEach(): Generator<{ node: BPlusNode<T, U>; pos: number }, void>
}

export class InternalNode<T, U> extends BPlusNode<T, U> {
	public next: InternalNode<T, U> | null

	public constructor(
		key: T,
		public leftBranch: BPlusNodeList<T, U>,
		public rightBranch: BPlusNodeList<T, U>
	) {
		super(key)
		this.next = null
	}
}

export class LeafNode<T, U> extends BPlusNode<T, U> {
	public next: LeafNode<T, U> | null

	public constructor(key: T, public value: U) {
		super(key)
		this.next = null
	}
}

export class InternalNodeList<T, U> extends BPlusNodeList<T, U> {
	public constructor(protected head: InternalNode<T, U>) {
		super()
	}

	private insertPrependHead(key: T, branch: BPlusNodeList<T, U>): void {
		const { leftBranch } = this.head
		const node = new InternalNode(key, branch, leftBranch)
		;[node.next, this.head] = [this.head, node]
	}

	private insertMiddle(key: T, branch: BPlusNodeList<T, U>, prevNode: InternalNode<T, U>): void {
		const currentNode = prevNode.next
		const { rightBranch } = prevNode
		const node = new InternalNode(key, rightBranch, branch)
		;[prevNode.next, node.next] = [node, currentNode]
		if (currentNode !== null) currentNode.leftBranch = branch
	}

	public insert(key: T, branch: BPlusNodeList<T, U>, insertPos: number): void {
		this.insertCheck(insertPos)
		if (insertPos === 0) return this.insertPrependHead(key, branch)

		let [currentNode, currentPos] = [this.head, 1]
		while (currentNode.next !== null) {
			if (currentPos === insertPos) break
			;[currentNode, currentPos] = [currentNode.next, currentPos + 1]
		}
		this.insertMiddle(key, branch, currentNode)
	}

	public *forEach() {
		let currentNode: InternalNode<T, U> | null = this.head,
			currentPos = 0
		while (currentNode !== null) {
			yield { node: currentNode, pos: currentPos }
			currentNode = currentNode.next
			++currentPos
		}
	}
}

export class LeafNodeList<T, U> extends BPlusNodeList<T, U> {
	protected head: LeafNode<T, U> | null

	public constructor() {
		super()
		this.head = null
	}

	private insertPrependHead(key: T, value: U): void {
		const node = new LeafNode(key, value)
		;[node.next, this.head] = [this.head, node]
	}

	private insertMiddle(key: T, value: U, prevNode: LeafNode<T, U>): void {
		const currentNode = prevNode.next
		const node = new LeafNode(key, value)
		;[prevNode.next, node.next] = [node, currentNode]
	}

	public insert(key: T, value: U, insertPos: number): void {
		this.insertCheck(insertPos)
		if (this.head === null) this.head = new LeafNode(key, value)
		if (insertPos === 0) return this.insertPrependHead(key, value)

		let [currentNode, currentPos] = [this.head, 1]
		while (currentNode.next !== null) {
			if (currentPos === insertPos) break
			;[currentNode, currentPos] = [currentNode.next, currentPos + 1]
		}
		this.insertMiddle(key, value, currentNode)
	}

	public *forEach() {
		let currentNode: LeafNode<T, U> | null = this.head,
			currentPos = 0
		while (currentNode !== null) {
			yield { node: currentNode, pos: currentPos }
			currentNode = currentNode.next
			++currentPos
		}
	}
}

type comparePriorityFn<T> = (keyA: T, keyB: T) => "higher" | "lower" | "equal"

export interface IBPlusTreeEntry<T, U> {
	key: T
	value: U
}

export interface ISplitBranch<T, U> {
	key: T
	node: BPlusNode<T, U>
}

export interface IBPlusTreeOptions {
	softUpdate: boolean
}

export class BPlusTree<T, U> {
	private readonly branchingFactor: number
	protected root: BPlusNodeList<T, U>
	protected height: number
	protected numEntries: number

	public constructor(
		branchingFactor: number,
		protected readonly compare: comparePriorityFn<T>,
		public readonly options: IBPlusTreeOptions = { softUpdate: false }
	) {
		this.branchingFactor = this.validateBranchingFactor(branchingFactor)
		this.root = new LeafNodeList<T, U>()
		this.height = 1
		this.numEntries = 0
	}

	@Validate
	private validateBranchingFactor(@Unsigned @Int branchingFactor: number): number {
		return branchingFactor
	}

	public clear(): void {
		this.root = new LeafNodeList<T, U>()
	}

	public get allowedMaxNodes(): number {
		return this.branchingFactor - 1
	}

	public get allowedMinNodes(): number {
		return Math.ceil(this.branchingFactor / 2) - 1
	}
}

// TODO: Complete the Insert Operation for Internal and Leaf Node Lists (B+ Tree)
