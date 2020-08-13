import immer, { immerable } from "immer";

class TreeNode {
	[immerable] = true;
	private leftChild: TreeNode | null;
	private rightChild: TreeNode | null;

	constructor(private nodeValue: string) {
		this.leftChild = null;
		this.rightChild = null;
	}

	addLeft(left: TreeNode | null): TreeNode {
		this.leftChild = left;
		return this;
	}

	addRight(right: TreeNode | null): TreeNode {
		this.rightChild = right;
		return this;
	}

	addChildren([left, right]: [TreeNode | null, TreeNode | null]): TreeNode {
		this.leftChild = left;
		this.rightChild = right;
		return this;
	}

	get value(): string {
		return this.nodeValue;
	}

	get left(): TreeNode | null {
		return immer(this.leftChild, () => {});
	}

	get right(): TreeNode | null {
		return immer(this.rightChild, () => {});
	}

	get children(): [TreeNode | null, TreeNode | null] {
		return immer([this.leftChild, this.rightChild], () => {});
	}
}

export { TreeNode };
