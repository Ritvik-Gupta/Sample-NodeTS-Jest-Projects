import { LinkedList } from "@/LinkedList"
import { InternalNode, LeafNode } from "./BPlusNode"
import { BPlusTree, IBPlusTreeEntry, priorityTypes } from "./BPlusTree"

class BPlusTreeMock<T, U> extends BPlusTree<T, U> {
	public get hasConsistentEntries(): boolean {
		let numEntries = 0
		const nodeQueue = new LinkedList("queue", [this.root])

		while (nodeQueue.length > 0) {
			const node = nodeQueue.delete()
			switch (true) {
				case node instanceof InternalNode: {
					const treeNode = node as InternalNode<T, U>
					treeNode.branch.forEach(branch => nodeQueue.insert(branch))
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
		const nodeQueue = new LinkedList("queue", [this.root])
		const levelQueue = new LinkedList("queue", [0])

		while (nodeQueue.length > 0 && levelQueue.length > 0) {
			const node = nodeQueue.delete()
			const level = levelQueue.delete()
			switch (true) {
				case node instanceof InternalNode: {
					const treeNode = node as InternalNode<T, U>
					treeNode.branch.forEach(branch => {
						nodeQueue.insert(branch)
						levelQueue.insert(level + 1)
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
		const nodeQueue = new LinkedList("queue", [this.root])

		while (nodeQueue.length > 0) {
			const node = nodeQueue.delete()
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
		const nodeQueue = new LinkedList("queue", [this.root])

		while (nodeQueue.length > 0) {
			const node = nodeQueue.delete()
			switch (true) {
				case node instanceof InternalNode: {
					const treeNode = node as InternalNode<T, U>
					treeNode.key.forEach(key => unusedIndexKeys.push(key))
					treeNode.branch.forEach(branch => nodeQueue.insert(branch))
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
		const nodeQueue = new LinkedList("queue", [this.root])
		const indicesQueue = new LinkedList<parentRange>("queue", [{}])

		while (nodeQueue.length > 0) {
			const node = nodeQueue.delete()
			const { higherRange, lowerRange } = indicesQueue.delete()

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
					nodeQueue.insert(branch)
					indicesQueue.insert({
						higherRange: pos === 0 ? treeNode.key.get(pos) : undefined,
						lowerRange: pos === treeNode.numKeys ? treeNode.key.get(pos - 1) : undefined,
					})
				})
			}
		}
		return true
	}
}

const priorities: priorityTypes[] = ["lower", "equal", "higher"]

type sortKeyFn<T> = (a: T, b: T) => -1 | 0 | 1
const treeMockValidationFn = <T, U>(tree: BPlusTreeMock<T, U>) => {
	expect(tree.hasCorrectNumeberOfLinks).toBeTruthy()
	expect(tree.hasConsistentEntries).toBeTruthy()
	expect(tree.hasConsistentTreeHeight).toBeTruthy()
	expect(tree.hasNoUnusedIndexKeys).toBeTruthy()
	expect(tree.hasOrderedSubTrees).toBeTruthy()
}

describe("Mock B+ Tree Instance with random values", () => {
	const sortKey: sortKeyFn<number> = (a, b) => (a > b ? 1 : a < b ? -1 : 0)
	const arr: IBPlusTreeEntry<number, string>[] = Array.from({ length: 100 }, (_, idx) => ({
		key: idx,
		value: idx.toString(),
	}))

	test("Check the Entries after each Insert operation", () => {
		const treeMock = new BPlusTreeMock<number, string>(
			5,
			(a, b) => priorities[sortKey(a, b) + 1]!,
			{ softUpdate: false }
		)

		arr.forEach(({ key, value }, idx) => {
			treeMock.insert({ key, value })
			treeMockValidationFn(treeMock)
			expect(treeMock.entries).toEqual(
				arr.filter((_, pos) => pos <= idx).sort((a, b) => sortKey(a.key, b.key))
			)
		})

		arr.forEach(({ key, value }) => {
			expect(treeMock.search(key)).toEqual(value)
		})
	})
})

describe("Mock B+ Tree Instance with Higher Order Key Structures", () => {
	type mockKey = { num: number; str: string }
	type mockTreeEntry<T, U> = IBPlusTreeEntry<T, U> & { updatedVal: U }

	const sortKey: sortKeyFn<mockKey> = (a, b) => {
		if (a.num > b.num) return 1
		else if (a.num < b.num) return -1
		else {
			if (a.str > b.str) return 1
			else if (a.str < b.str) return -1
			return 0
		}
	}

	const arr: mockTreeEntry<mockKey, string>[] = [
		{ key: { num: 20, str: "c" }, value: "A01", updatedVal: "B01" },
		{ key: { num: 10, str: "a" }, value: "A02", updatedVal: "B02" },
		{ key: { num: 10, str: "b" }, value: "A03", updatedVal: "B03" },
		{ key: { num: 20, str: "b" }, value: "A04", updatedVal: "B04" },
		{ key: { num: 40, str: "b" }, value: "A05", updatedVal: "B05" },
		{ key: { num: 30, str: "b" }, value: "A06", updatedVal: "B06" },
		{ key: { num: 30, str: "c" }, value: "A07", updatedVal: "B07" },
		{ key: { num: 60, str: "a" }, value: "A08", updatedVal: "B08" },
		{ key: { num: 70, str: "b" }, value: "A09", updatedVal: "B09" },
		{ key: { num: 70, str: "c" }, value: "A10", updatedVal: "B10" },
	]

	test("Check the Entries after each Insert operation", () => {
		const treeMock = new BPlusTreeMock<mockKey, string>(
			3,
			(a, b) => priorities[sortKey(a, b) + 1]!,
			{ softUpdate: false }
		)

		arr.forEach(({ key, value }, idx) => {
			treeMock.insert({ key, value })
			treeMockValidationFn(treeMock)
			expect(treeMock.entries).toEqual(
				arr
					.map(({ key, value }) => ({ key, value }))
					.filter((_, pos) => pos <= idx)
					.sort((a, b) => sortKey(a.key, b.key))
			)
		})

		expect(() => {
			treeMock.insert({ key: { num: 40, str: "b" }, value: "X" })
		}).toThrowError("Duplicate Key found. Insertion Failed")

		arr.forEach(({ key, value, updatedVal }, idx) => {
			const prevVal = treeMock.update({ key, value: updatedVal })
			treeMockValidationFn(treeMock)
			expect(prevVal).toEqual(value)
			expect(treeMock.entries).toEqual(
				arr
					.map(({ key, value, updatedVal }, pos) =>
						pos <= idx ? { key, value: updatedVal } : { key, value }
					)
					.sort((a, b) => sortKey(a.key, b.key))
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
