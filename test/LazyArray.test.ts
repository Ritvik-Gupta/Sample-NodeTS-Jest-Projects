import { ArrCtx, createArrayGen, LazyArray } from "../src/LazyArray";

describe(`Compare the Array Generators`, () => {
	const arr = Array.from({ length: 10 }, (_, pos) => pos * 15);
	const gen = createArrayGen(arr);

	test(`Compare different Iterations`, () => {
		let nextItr = gen.next("none");

		const collectItr1: ArrCtx<number>[] = [];
		while (nextItr.done === false && nextItr.value.iteration < 1) {
			collectItr1.push({ val: nextItr.value.val, pos: nextItr.value.pos });
			nextItr = gen.next("none");
		}

		const collectItr2: ArrCtx<number>[] = [];
		while (nextItr.done === false && nextItr.value.iteration < 2) {
			collectItr2.push({ val: nextItr.value.val, pos: nextItr.value.pos });
			nextItr = gen.next("none");
		}

		expect(collectItr1).toEqual(collectItr2);
	});
});

describe(`Compare the Responses for Normal and Lazy Array Implementation`, () => {
	const arr = Array.from({ length: 10 }, (_, pos) => pos * 15);
	const lazyArr = LazyArray.create(arr);

	test(`Blank Compare`, () => {
		expect(arr).toEqual(lazyArr.collect());
	});

	test(`Compare Lazy Array Copies`, () => {
		expect(lazyArr.collect()).toEqual(lazyArr.collect());
	});
});
