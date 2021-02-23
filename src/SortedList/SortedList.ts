import { Int, iterativeFn, Unsigned, Validate } from "@/assets"

export type mapCallbackFn<T, U> = iterativeFn<T, U>

export type normalizeFn<T> = (elm: T) => number

export class SortedList<T> {
	private readonly list: T[]

	public constructor(private readonly normalize: normalizeFn<T>) {
		this.list = []
	}

	public get length(): number {
		return this.list.length
	}

	@Validate
	public at(@Unsigned @Int pos: number): T {
		const elm = this.list[pos]
		if (elm !== undefined) return elm
		throw RangeError("List Element Position Out of Bounds")
	}

	public push(value: T): void {
		let startPos = 0,
			endPos = this.length
		while (startPos < endPos) {
			const midPos = Math.floor((startPos + endPos) / 2)
			const middleOrder = this.normalize(this.at(midPos))
			const valueOrder = this.normalize(value)

			if (middleOrder > valueOrder) endPos = midPos
			else startPos = midPos + 1
		}
		this.list.splice(endPos, 0, value)
	}

	public pop(): T {
		if (this.length > 0) return this.list.pop()!
		throw RangeError("List is Empty")
	}

	public map<U>(mapFn: mapCallbackFn<T, U>): U[] {
		return this.list.map(mapFn)
	}
}
