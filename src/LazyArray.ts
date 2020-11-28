export interface ArrCtx<T> {
	val: T;
	pos: number;
}
export type ArrGen<T> = Generator<ArrCtx<T> & { iteration: number }, void, boolean>;

type reduceCollection<T> = { collected: T };

export function* createArrayGen<T>(arr: T[]): ArrGen<T> {
	for (let iteration = 0; ; ++iteration)
		for (let pos = 0; pos < arr.length; ++pos) {
			const resetItr = yield { val: arr[pos], pos, iteration };
			if (resetItr === true) {
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
			let nextVal = next();
			while (nextVal.done === false)
				nextVal = next(yield { ...nextVal.value, val: mapFn(nextVal.value) });
		};
		return new LazyArray(mapGen(this.arrGen));
	}

	filter(filterFn: (ctx: ArrCtx<T>) => boolean): LazyArray<T> {
		const filterGen = function* ({ next }: ArrGen<T>): ArrGen<T> {
			let nextVal = next(),
				pos = 0;
			while (nextVal.done === false) {
				if (filterFn(nextVal.value) === false) nextVal = next();
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
			let collected = 0,
				pos = 0,
				nextVal = next();
			while (nextVal.done === false && collected < take) {
				if ((pos + 1) % skip === 0) {
					yield { ...nextVal.value, iteration: 0 };
					++collected;
				}
				++pos;
				nextVal = next();
			}
		};
		return new LazyArray(roundWalkGen(this.arrGen));
	}

	reduce<U>(
		reduceFn: (ctx: ArrCtx<T> & reduceCollection<U>) => U,
		{ collected }: reduceCollection<U>
	): U {
		let nextVal = this.arrGen.next(),
			pos = 0;
		while (nextVal.done === false && nextVal.value.iteration === 0) {
			collected = reduceFn({ val: nextVal.value.val, pos, collected });
			nextVal = this.arrGen.next();
			++pos;
		}
		this.arrGen.next(true);
		return collected;
	}

	collect(): T[] {
		const arr: T[] = [];
		let nextVal = this.arrGen.next();
		while (nextVal.done === false && nextVal.value.iteration === 0) {
			arr.push(nextVal.value.val);
			nextVal = this.arrGen.next();
		}
		this.arrGen.next(true);
		return arr;
	}
}
