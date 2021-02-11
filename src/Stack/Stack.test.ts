import { FiniteStack, Stack } from "./Stack"

class StackMock<T> extends Stack<T> {
	constructor(prevStack?: T[] | undefined) {
		super(prevStack)
	}

	public get entries(): T[] {
		return this.arr
	}
}

describe("Creates a Valid Stack", () => {
	const stack = new StackMock<number>([1, 2, 4, 5])

	test("Creates a Blank Array Stack", () => {
		expect(stack.entries).toEqual([1, 2, 4, 5])
	})
})

class FiniteStackMock<T> extends FiniteStack<T> {
	constructor(size: number, prevStack?: T[] | undefined) {
		super(size, prevStack)
	}

	public get entries(): T[] {
		return this.arr
	}
}

describe("Creates a Finite Stack and runs Operations", () => {
	const stack = new FiniteStackMock(5, [10, 20, 30])

	test("Creates a Size 5 Stack", () => {
		expect(stack.entries).toEqual([10, 20, 30])
		expect(stack.push(1)).toEqual(true)
		expect(stack.push(2)).toEqual(true)
		expect(stack.push(3)).toEqual(false)
		expect(stack.push(4)).toEqual(false)
		expect(stack.push(5)).toEqual(false)
		expect(stack.push(6)).toEqual(false)
		expect(stack.entries).toEqual([10, 20, 30, 1, 2])
	})
})
