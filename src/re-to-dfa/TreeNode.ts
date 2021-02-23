import immer, { immerable } from "immer"

export class TreeNode {
	[immerable] = true
	private leftKid: TreeNode | null
	private rightKid: TreeNode | null

	constructor(private nodeValue: string) {
		this.leftKid = null
		this.rightKid = null
	}

	addLeft(left: TreeNode | null): TreeNode {
		this.leftKid = left
		return this
	}

	addRight(right: TreeNode | null): TreeNode {
		this.rightKid = right
		return this
	}

	addKids(...[left, right]: [TreeNode | null, TreeNode | null]): TreeNode {
		this.leftKid = left
		this.rightKid = right
		return this
	}

	static isValid(node: TreeNode | null): boolean {
		const validOper = {
			"*": (node: TreeNode) => node.leftKid !== null && node.rightKid === null,
			".": (node: TreeNode) => node.leftKid !== null && node.rightKid !== null,
			"+": (node: TreeNode) => node.leftKid !== null && node.rightKid !== null,
		}

		if (node === null) return false
		return Object.keys(validOper).includes(node.value)
			? validOper[node.value as keyof typeof validOper](node)
			: node.left === null && node.right === null
	}

	get value(): string {
		return this.nodeValue
	}

	get left(): TreeNode | null {
		return immer(this.leftKid, () => {})
	}

	get right(): TreeNode | null {
		return immer(this.rightKid, () => {})
	}

	get kids(): [TreeNode | null, TreeNode | null] {
		return immer([this.leftKid, this.rightKid], () => {})
	}
}
