import { LinkedList, listBehaviour } from "./LinkedList"

class LinkedListMock<T> extends LinkedList<T> {
	public get entries(): T[] {
		const entry: T[] = []
		for (const elm of this.each()) entry.push(elm)
		return entry
	}
}

const getRandomStr = () => {
	let str = ""
	const len = 50 + Math.floor(Math.random() * 50)
	for (let i = 0; i < len; ++i) str += String.fromCharCode(Math.floor(Math.random() * 255))
	return str
}

const dataset: any[][] = [
	Array.from({ length: 50 }, Math.random),
	Array.from({ length: 50 }, getRandomStr),
]

describe.each(dataset)("Mock Linked List Instance with dataset [ %# ]", (...data) => {
	const listBehaviours: listBehaviour[] = ["stack", "queue", "reversed-stack", "reversed-queue"]

	listBehaviours.forEach(behaviour => {
		test(`Operations of Linked List as a ${behaviour}`, () => {
			const list = new LinkedListMock(behaviour)
			const arr: any[] = []
			data.forEach(elm => {
				list.insert(elm)
				behaviour === "stack" || behaviour === "queue" ? arr.push(elm) : arr.unshift(elm)
				expect(list.entries).toEqual(arr)
			})
			data.forEach(() => {
				expect(list.delete()).toBe(
					behaviour === "reversed-queue" || behaviour === "stack" ? arr.pop()! : arr.shift()!
				)
				expect(list.entries).toEqual(arr)
			})
			expect(() => {
				list.delete()
			}).toThrowError(/List is Empty/)
			expect(list.length).toBe(0)
		})
	})
})
