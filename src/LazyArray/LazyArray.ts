import { InRange, Int, Unsigned, Validate } from "@/assets"

type reduceCollection<T> = { collected: T }
type lazyIterativeFn<T, U> = (ctx: ArrCtx<T>) => U
type lazyReduceFn<T, U> = (ctx: ArrCtx<T> & reduceCollection<U>) => U

export interface ArrCtx<T> {
	val: T
	pos: number
}

export type ItrCtx<T> = ArrCtx<T> & { iteration: number }
export type ArrGen<T> = Generator<ItrCtx<T>, void, "reset" | "none">

export function* createArrayGen<T>(arr: T[]): ArrGen<T> {
	if (arr.length === 0) return
	for (let iteration = 0; ; ++iteration)
		for (let pos = 0; pos < arr.length; ++pos) {
			const nextState = yield { val: arr[pos]!, pos, iteration }
			if (nextState === "reset") {
				iteration = -1
				yield { val: arr[pos]!, pos, iteration }
				break
			}
		}
}

export class LazyArray<T> {
	private constructor(private readonly arrGen: ArrGen<T>) {}

	public static clone<T>(arr: T[]): LazyArray<T> {
		return new LazyArray(createArrayGen(arr))
	}

	public map<U>(mapFn: lazyIterativeFn<T, U>): LazyArray<U> {
		const mapGen = function* ({ next }: ArrGen<T>): ArrGen<U> {
			let nextVal = next("none")
			while (nextVal.done === false)
				nextVal = next(yield { ...nextVal.value, val: mapFn(nextVal.value) })
		}
		return new LazyArray(mapGen(this.arrGen))
	}

	public filter(filterFn: lazyIterativeFn<T, boolean>): LazyArray<T> {
		const filterGen = function* ({ next }: ArrGen<T>): ArrGen<T> {
			let nextVal = next("none"),
				pos = 0
			while (nextVal.done === false) {
				if (nextVal.value.pos === 0) pos = 0
				if (filterFn(nextVal.value) === false) nextVal = next("none")
				else {
					nextVal = next(yield { ...nextVal.value, pos })
					++pos
				}
			}
		}
		return new LazyArray(filterGen(this.arrGen))
	}

	public reduce<U>(reduceFn: lazyReduceFn<T, U>, { collected }: reduceCollection<U>): U {
		let nextVal = this.arrGen.next("none")
		while (nextVal.done === false && nextVal.value.iteration === 0) {
			collected = reduceFn({ ...nextVal.value, collected })
			nextVal = this.arrGen.next("none")
		}
		this.arrGen.next("reset")
		return collected
	}

	@Validate
	public roundWalk(
		@Unsigned @Int @InRange({ lower: 1 }) skip: number,
		@Unsigned @Int @InRange({ lower: 1 }) take: number
	): LazyArray<T> {
		const roundWalkGen = function* ({ next }: ArrGen<T>): ArrGen<T> {
			let nextVal = next("none"),
				pos = 0,
				counted = 0,
				iteration = 0
			while (nextVal.done === false) {
				++counted
				if (counted % skip === 0) {
					const yieldVal = yield { ...nextVal.value, pos, iteration }
					++pos
					if (pos === take || yieldVal === "reset") {
						next("reset")
						pos = 0
						counted = 0
						if (yieldVal === "reset") {
							iteration = -1
							yield { ...nextVal.value, pos, iteration }
						}
						++iteration
					}
				}
				nextVal = next("none")
			}
		}
		return new LazyArray(roundWalkGen(this.arrGen))
	}

	public forEach(forEachFn: lazyIterativeFn<T, void>): void {
		let nextVal = this.arrGen.next("none")
		while (nextVal.done === false && nextVal.value.iteration === 0) {
			forEachFn(nextVal.value)
			nextVal = this.arrGen.next("none")
		}
		this.arrGen.next("reset")
	}

	public collect(): T[] {
		const arr: T[] = []
		let nextVal = this.arrGen.next("none")
		while (nextVal.done === false && nextVal.value.iteration === 0) {
			arr.push(nextVal.value.val)
			nextVal = this.arrGen.next("none")
		}
		this.arrGen.next("reset")
		return arr
	}

	@Validate
	public debug(@Unsigned @Int @InRange({ lower: 1 }) numItr: number): ItrCtx<T>[] {
		const arr: ItrCtx<T>[] = []
		let nextVal = this.arrGen.next("none")
		while (nextVal.done === false && nextVal.value.iteration < numItr) {
			arr.push(nextVal.value)
			nextVal = this.arrGen.next("none")
		}
		this.arrGen.next("reset")
		return arr
	}
}
