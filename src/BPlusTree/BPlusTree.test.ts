import { Stack } from "../Stack"
import { BPlusNode, InternalNode, LeafNode } from "./BPlusNode"
import { BPlusTree, comparePriorityFn, IBPlusTreeEntry, IBPlusTreeOptions } from "./BPlusTree"

class BPlusTreeMock<T, U> extends BPlusTree<T, U> {
	constructor(...args: [number, comparePriorityFn<T>, IBPlusTreeOptions?]) {
		super(...args)
	}

	public get hasConsistentEntries(): boolean {
		let numEntries = 0
		const nodeStack: Stack<BPlusNode<T, U>> = new Stack([this.root])

		while (nodeStack.length > 0) {
			const node = nodeStack.pop()!
			switch (true) {
				case node instanceof InternalNode: {
					const treeNode = node as InternalNode<T, U>
					treeNode.branch.forEach(branch => nodeStack.push(branch))
					break
				}
				case node instanceof LeafNode: {
					const treeNode = node as LeafNode<T, U>
					numEntries += treeNode.numValues
					break
				}
			}
		}
		return this.numEntries === numEntries
	}

	public get hasConsistentTreeHeight(): boolean {
		const nodeStack: Stack<BPlusNode<T, U>> = new Stack([this.root])
		const levelStack: Stack<number> = new Stack([0])

		while (nodeStack.length > 0 && levelStack.length > 0) {
			const node = nodeStack.pop()!
			const level = levelStack.pop()!
			switch (true) {
				case node instanceof InternalNode: {
					const treeNode = node as InternalNode<T, U>
					treeNode.branch.forEach(branch => {
						nodeStack.push(branch)
						levelStack.push(level + 1)
					})
					break
				}
				case node instanceof LeafNode: {
					if (this.height !== level + 1) return false
					break
				}
			}
		}
		return true
	}

	public get hasCorrectNumeberOfLinks(): boolean {
		const nodeStack: Stack<BPlusNode<T, U>> = new Stack([this.root])

		while (nodeStack.length > 0) {
			const node = nodeStack.pop()!
			switch (true) {
				case node instanceof InternalNode: {
					const treeNode = node as InternalNode<T, U>
					if (treeNode.numBranches !== treeNode.numKeys + 1) return false
					break
				}
				case node instanceof LeafNode: {
					const treeNode = node as LeafNode<T, U>
					if (treeNode.numValues !== treeNode.numKeys) return false
					break
				}
			}
		}
		return true
	}

	public get hasNoUnusedIndexKeys(): boolean {
		let unusedIndexKeys: T[] = []
		const nodeStack: Stack<BPlusNode<T, U>> = new Stack([this.root])

		while (nodeStack.length > 0) {
			const node = nodeStack.pop()!
			switch (true) {
				case node instanceof InternalNode: {
					const treeNode = node as InternalNode<T, U>
					treeNode.key.forEach(key => unusedIndexKeys.push(key))
					treeNode.branch.forEach(branch => nodeStack.push(branch))
					break
				}
				case node instanceof LeafNode: {
					const treeNode = node as LeafNode<T, U>
					treeNode.key.forEach(key => {
						unusedIndexKeys = unusedIndexKeys.filter(
							indexKey => this.compare(indexKey, key) !== "equal"
						)
					})
					break
				}
			}
		}
		return unusedIndexKeys.length === 0
	}

	public get hasOrderedSubTrees(): boolean {
		type parentRange = Partial<Record<"lowerRange" | "higherRange", T>>
		const indicesStack: Stack<parentRange> = new Stack([{}])
		const nodeStack: Stack<BPlusNode<T, U>> = new Stack([this.root])

		while (nodeStack.length > 0) {
			const node = nodeStack.pop()!
			const { higherRange, lowerRange } = indicesStack.pop()!

			node.key.forEach((key, pos) => {
				if (higherRange !== undefined && this.compare(key, higherRange) !== "lower") return false
				if (lowerRange !== undefined) {
					const priority = this.compare(key, lowerRange)
					if (pos === 0 && node instanceof LeafNode && priority !== "equal") return false
					else if (priority !== "higher") return false
				}
			})

			if (node instanceof InternalNode) {
				const treeNode = node as InternalNode<T, U>
				treeNode.branch.forEach((branch, pos) => {
					nodeStack.push(branch)
					indicesStack.push({
						higherRange: pos === 0 ? treeNode.key.get(pos) : undefined,
						lowerRange: pos === treeNode.numKeys ? treeNode.key.get(pos - 1) : undefined,
					})
				})
			}
		}
		return true
	}
}

type mockKey = { num: number; str: string }
type mockTreeEntry<T, U> = IBPlusTreeEntry<T, U> & { updatedVal: U }

const sortKeyFn = (a: mockKey, b: mockKey) => {
	if (a.num > b.num) return 1
	else if (a.num < b.num) return -1
	else {
		if (a.str > b.str) return 1
		else if (a.str < b.str) return -1
		return 0
	}
}

describe("Mock B+ Tree Instance and check for correctness", () => {
	const treeMock = new BPlusTreeMock<mockKey, string>(
		5,
		(a, b) => {
			const result = sortKeyFn(a, b)
			return result === -1 ? "lower" : result === 1 ? "higher" : "equal"
		},
		{ softUpdate: false }
	)

	const treeMockValidationFn = () => {
		expect(treeMock.hasCorrectNumeberOfLinks).toBeTruthy()
		expect(treeMock.hasConsistentEntries).toBeTruthy()
		expect(treeMock.hasConsistentTreeHeight).toBeTruthy()
		expect(treeMock.hasNoUnusedIndexKeys).toBeTruthy()
		expect(treeMock.hasOrderedSubTrees).toBeTruthy()
	}

	test("Check the Entries after each Insert operation", () => {
		const arr: mockTreeEntry<mockKey, string>[] = [
			{ key: { num: 20, str: "c" }, value: "A", updatedVal: "P" },
			{ key: { num: 10, str: "a" }, value: "B", updatedVal: "Q" },
			{ key: { num: 10, str: "b" }, value: "C", updatedVal: "R" },
			{ key: { num: 20, str: "b" }, value: "D", updatedVal: "S" },
			{ key: { num: 40, str: "b" }, value: "E", updatedVal: "T" },
			{ key: { num: 30, str: "b" }, value: "F", updatedVal: "U" },
		]

		arr.forEach(({ key, value }, idx) => {
			treeMock.insert({ key, value })
			treeMockValidationFn()
			expect(treeMock.entries).toEqual(
				arr
					.map(({ key, value }) => ({ key, value }))
					.filter((_, pos) => pos <= idx)
					.sort((a, b) => sortKeyFn(a.key, b.key))
			)
		})

		expect(() => {
			treeMock.insert({ key: { num: 40, str: "b" }, value: "X" })
		}).toThrowError("Duplicate Key found. Insertion Failed")

		arr.forEach(({ key, value, updatedVal }, idx) => {
			const prevVal = treeMock.update({ key, value: updatedVal })
			treeMockValidationFn()
			expect(prevVal).toEqual(value)
			expect(treeMock.entries).toEqual(
				arr
					.map(({ key, value, updatedVal }, pos) =>
						pos <= idx ? { key, value: updatedVal } : { key, value }
					)
					.sort((a, b) => sortKeyFn(a.key, b.key))
			)
		})

		expect(() => {
			treeMock.update({ key: { num: 10, str: "c" }, value: "X" })
		}).toThrowError("Invalid Key, not present in the Tree")

		arr.forEach(({ key, updatedVal }) => {
			expect(treeMock.search(key)).toEqual(updatedVal)
		})
	})
})

describe("Mock B+ Tree Instance with random values", () => {})
