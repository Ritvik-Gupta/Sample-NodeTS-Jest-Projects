export interface ArrCtx<T> {
	val: T;
	pos: number;
}
export type ItrCtx<T> = ArrCtx<T> & { iteration: number };
export type ArrGen<T> = Generator<ItrCtx<T>, void, "reset" | "none">;

type reduceCollection<T> = { collected: T };

export function* createArrayGen<T>(arr: T[]): ArrGen<T> {
	if (arr.length === 0) return;
	for (let iteration = 0; ; ++iteration)
		for (let pos = 0; pos < arr.length; ++pos) {
			const nextState = yield { val: arr[pos], pos, iteration };
			if (nextState === "reset") {
				iteration = -1;
				yield { val: arr[pos], pos, iteration };
				break;
			}
		}
}

export class LazyArray<T> {
	constructor(private readonly arrGen: ArrGen<T>) {}

	static create<T>(arr: T[]): LazyArray<T> {
		return new LazyArray(createArrayGen(arr));
	}

	map<U>(mapFn: (ctx: ArrCtx<T>) => U): LazyArray<U> {
		const mapGen = function* ({ next }: ArrGen<T>): ArrGen<U> {
			let nextVal = next("none");
			while (nextVal.done === false)
				nextVal = next(yield { ...nextVal.value, val: mapFn(nextVal.value) });
		};
		return new LazyArray(mapGen(this.arrGen));
	}

	filter(filterFn: (ctx: ArrCtx<T>) => boolean): LazyArray<T> {
		const filterGen = function* ({ next }: ArrGen<T>): ArrGen<T> {
			let nextVal = next("none"),
				pos = 0;
			while (nextVal.done === false) {
				if (nextVal.value.pos === 0) pos = 0;
				if (filterFn(nextVal.value) === false) nextVal = next("none");
				else {
					nextVal = next(yield { ...nextVal.value, pos });
					++pos;
				}
			}
		};
		return new LazyArray(filterGen(this.arrGen));
	}

	roundWalk(skip: number, take: number): LazyArray<T> {
		if (skip <= 0) skip = 1;
		if (take <= 0) take = 1;
		const roundWalkGen = function* ({ next }: ArrGen<T>): ArrGen<T> {
			let nextVal = next("none"),
				pos = 0,
				counted = 0,
				iteration = 0;
			while (nextVal.done === false) {
				++counted;
				if (counted % skip === 0) {
					const yieldVal = yield { ...nextVal.value, pos, iteration };
					++pos;
					if (pos === take || yieldVal === "reset") {
						next("reset");
						pos = 0;
						counted = 0;
						if (yieldVal === "reset") {
							yield { ...nextVal.value, pos, iteration };
							iteration = 0;
						} else ++iteration;
					}
				}
				nextVal = next("none");
			}
		};
		return new LazyArray(roundWalkGen(this.arrGen));
	}

	reduce<U>(
		reduceFn: (ctx: ArrCtx<T> & reduceCollection<U>) => U,
		{ collected }: reduceCollection<U>
	): U {
		let nextVal = this.arrGen.next("none");
		while (nextVal.done === false && nextVal.value.iteration === 0) {
			collected = reduceFn({ ...nextVal.value, collected });
			nextVal = this.arrGen.next("none");
		}
		this.arrGen.next("reset");
		return collected;
	}

	collect(): T[] {
		const arr: T[] = [];
		let nextVal = this.arrGen.next("none");
		while (nextVal.done === false && nextVal.value.iteration === 0) {
			arr.push(nextVal.value.val);
			nextVal = this.arrGen.next("none");
		}
		this.arrGen.next("reset");
		return arr;
	}

	debug(numItr: number): ItrCtx<T>[] {
		if (numItr <= 0) numItr = 1;
		const arr: ItrCtx<T>[] = [];
		let nextVal = this.arrGen.next("none");
		while (nextVal.done === false && nextVal.value.iteration < numItr) {
			arr.push(nextVal.value);
			nextVal = this.arrGen.next("none");
		}
		this.arrGen.next("reset");
		return arr;
	}
}

export const arrayRoundWalk = <T>(arr: T[], skip: number, take: number): T[] => {
	if (arr.length === 0) return [];
	if (skip <= 0) skip = 1;
	if (take <= 0) take = 1;
	const roundArr: T[] = [];
	let pos = 0,
		counted = 0;
	while (pos < take) {
		for (const elm of arr) {
			++counted;
			if (counted % skip === 0) {
				++pos;
				roundArr.push(elm);
				if (pos === take) break;
			}
		}
	}
	return roundArr;
};
