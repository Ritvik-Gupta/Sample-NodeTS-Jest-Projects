export class InitNode<T> {
	public next: BranchNode<T> | null;
	public branch: BPlusList<T> | null;

	public constructor() {
		this.next = null;
		this.branch = null;
	}
}

export class BranchNode<T> extends InitNode<T> {
	public constructor(public readonly value: T) {
		super();
	}
}

export type UnionNode<T> = InitNode<T> | BranchNode<T>;
export type branchTypes = "root" | "internal" | "leaf";

export interface IBPlusTreeOptions<T> {
	branchingFactor: number;
	normalize(value: T): number;
}

export interface ISiblingBranch<T> {
	value: T;
	siblingBranch: BPlusList<T>;
}

export class BPlusList<T> {
	private head: InitNode<T>;
	private parent: BPlusList<T> | null;

	public constructor(private readonly options: IBPlusTreeOptions<T>) {
		this.head = new InitNode();
		this.parent = null;
	}

	public get branchType(): branchTypes {
		if (this.parent === null) return "root";
		if (this.parent !== null && this.head.branch !== null) return "internal";
		return "leaf";
	}

	public get hasMaxNodes(): boolean {
		return this.options.branchingFactor - this.length < 1;
	}

	public get hasMinNodes(): boolean {
		return Math.ceil(this.options.branchingFactor / 2) - this.length > 1;
	}

	public get array(): T[] {
		const array: T[] = [];
		let currentNode: BranchNode<T> | null = this.head.next;
		while (currentNode !== null) {
			array.push(currentNode.value);
			currentNode = currentNode.next;
		}
		return array;
	}

	public get length(): number {
		let length = 0;
		let currentNode: BranchNode<T> | null = this.head.next;
		while (currentNode !== null) {
			++length;
			currentNode = currentNode.next;
		}
		return length;
	}

	private add(value: T): void {
		let prevNode: UnionNode<T> = this.head;
		let currentNode: BranchNode<T> | null = prevNode.next;

		while (true) {
			if (
				currentNode === null ||
				this.options.normalize(currentNode.value) >= this.options.normalize(value)
			) {
				if (
					this.branchType === "leaf" ||
					(this.branchType === "root" && prevNode.branch === null)
				) {
					const node = new BranchNode(value);
					[prevNode.next, node.next] = [node, currentNode];
				} else if (
					this.branchType === "internal" ||
					(this.branchType === "root" && prevNode.branch !== null)
				) {
					if (prevNode.branch === null) throw Error("Internal List should have a Branch");
					const branchUp = prevNode.branch.append(value);

					if (branchUp !== null) {
						const node = new BranchNode(branchUp.value);
						[prevNode.next, node.next] = [node, currentNode];
						node.branch = branchUp.siblingBranch;
						node.branch.parent = this;
					}
				}
				break;
			}
			prevNode = currentNode;
			currentNode = currentNode.next;
		}
	}

	private splitMiddle(): ISiblingBranch<T> {
		const middlePos = Math.floor(this.length / 2) + 1;
		let prevNode: UnionNode<T> | null = this.head;
		let currentNode: BranchNode<T> | null = prevNode.next,
			count = 1;

		while (currentNode !== null) {
			if (count === middlePos) {
				prevNode.next = null;
				const siblingBranch = new BPlusList(this.options);
				siblingBranch.head.next = currentNode;
				return { value: currentNode.value, siblingBranch };
			}
			prevNode = currentNode;
			currentNode = currentNode.next;
			++count;
		}
		throw Error("Unexpected Error, cannot Split List");
	}

	public append(value: T): ISiblingBranch<T> | null {
		this.add(value);
		if (this.hasMaxNodes) {
			if (this.branchType !== "root") return this.splitMiddle();

			const { value, siblingBranch } = this.splitMiddle();
			const root = new BPlusList(this.options);
			root.head.branch = this;
			this.parent = root;

			root.head.next = new BranchNode(value);
			root.head.next.branch = siblingBranch;
			siblingBranch.parent = root;
			return { value, siblingBranch: root };
		}
		return null;
	}

	public print(): void {
		let currentNode: UnionNode<T> | null = this.head;
		while (currentNode !== null) {
			if (this.branchType === "leaf") {
				if (currentNode instanceof BranchNode) console.log(currentNode.value);
			}
			currentNode.branch?.print();
			// console.log("Value :\t", currentNode.value);
			// if (currentNode.branch !== null) {
			// 	console.log("Branch :\t", currentNode.branch.array);
			// 	console.log("----");
			// 	currentNode.branch.print();
			// 	console.log("----");
			// }
			currentNode = currentNode.next;
		}
	}
}

export class BPlusTree<T> {
	private root: BPlusList<T>;

	public constructor(private readonly options: IBPlusTreeOptions<T>) {
		this.root = new BPlusList({ ...this.options });
	}

	public append(value: T): void {
		const branchUp = this.root.append(value);
		if (branchUp !== null) this.root = branchUp.siblingBranch;
	}

	public print(): void {
		this.root.print();
	}
}

export class X {
	private readonly b: X.Y;

	constructor(private readonly a: number) {
		this.b = new X.Y("13");
		this.a;
		this.b;
	}

	public static readonly Y = class Z {
		public readonly d: X;

		constructor(private readonly c: string) {
			this.d = new X(1);
			this.c;
		}
	};
}

export namespace X {
	export type Y = InstanceType<typeof X.Y>;
}
