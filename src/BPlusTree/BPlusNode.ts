type customGenArrayObj<T> = {
	insert: (value: T, insertPos: number) => T[];
	get: (index: number) => T;
	forEach: (callbackFn: (elm: T, pos: number) => void) => void;
};

const customGenArray = <T>(arr: T[], name: string): customGenArrayObj<T> => ({
	get: index => {
		const elm = arr[index];
		if (elm === undefined) throw RangeError(`${name} Index Out of Bounds`);
		return elm;
	},
	forEach: callbackFn => {
		arr.forEach(callbackFn);
	},
	insert: (value, insertPos) => arr.splice(insertPos, 0, value),
});

export abstract class BPlusNode<T> {
	protected readonly keys: T[];
	public readonly key: customGenArrayObj<T>;

	public constructor() {
		this.keys = [];
		this.key = customGenArray(this.keys, "Key");
	}

	public get numKeys(): number {
		return this.keys.length;
	}

	public abstract split(): ISplitBranch<T>;
}

export interface ISplitBranch<T> {
	key: T;
	node: BPlusNode<T>;
}

export class InternalNode<T, U> extends BPlusNode<T> {
	private readonly branches: BPlusNode<T>[];
	public readonly branch: customGenArrayObj<BPlusNode<T>>;

	public constructor(key: T, leftBranch: BPlusNode<T>, rightBranch: BPlusNode<T>) {
		super();
		this.branches = [leftBranch, rightBranch];
		this.keys.push(key);
		this.branch = customGenArray(this.branches, "Branch");
	}

	public get numBranches(): number {
		return this.branches.length;
	}

	public split(): ISplitBranch<T> {
		const middlePos = Math.floor(this.keys.length / 2);
		const branchUpKey = this.keys[middlePos]!;

		const splitKeys = this.keys.splice(middlePos + 1);
		this.keys.pop();
		const splitBranches = this.branches.splice(middlePos + 1);
		if (splitKeys.length < 1) throw Error("Internal Nodes should have atleast 1 key");
		if (splitBranches.length < 2) throw Error("Internal Node should have atleast 2 branches");

		const splitNode = new InternalNode<T, U>(
			splitKeys.shift()!,
			splitBranches.shift()!,
			splitBranches.shift()!
		);
		splitNode.keys.push(...splitKeys);
		splitNode.branches.push(...splitBranches);
		return { key: branchUpKey, node: splitNode };
	}
}

export class LeafNode<T, U> extends BPlusNode<T> {
	private readonly values: U[];
	public readonly value: customGenArrayObj<U>;

	public constructor() {
		super();
		this.values = [];
		this.value = customGenArray(this.values, "Value");
	}

	public get numValues(): number {
		return this.values.length;
	}

	public setValue(index: number, value: U): void {
		if (this.values[index] === undefined) throw RangeError("Value Index Out of Bounds");
		this.values[index] = value;
	}

	public split(): ISplitBranch<T> {
		const middlePos = Math.floor(this.keys.length / 2);
		const branchUpKey = this.keys[middlePos]!;

		const splitNode = new LeafNode<T, U>();
		for (let i = this.keys.length - 1; i >= middlePos; --i) {
			splitNode.keys.unshift(this.keys.pop()!);
			splitNode.values.unshift(this.values.pop()!);
		}
		return { key: branchUpKey, node: splitNode };
	}
}
