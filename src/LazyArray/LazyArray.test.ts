import { arrayRoundWalk, ArrCtx, createArrayGen, LazyArray } from "./LazyArray";

const dataset: number[][] = [
	Array.from({ length: 10 }, (_, pos) => pos * 15),
	Array.from({ length: 100 }, () => Math.random()),
	Array.from({ length: 50 }, (_, pos) => pos * Math.random()),
	Array.from({ length: 0 }, (_, pos) => pos),
];

describe.each(dataset)("Compare the Array Generators using Array (%#)", (...array) => {
	test("Compare different Iterations", () => {
		const gen = createArrayGen(array);
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

describe.each(dataset)("Compare the Lazy Array Implementation using Array (%#)", (...array) => {
	const lazyArr = LazyArray.create(array);
	test("Compare Lazy Array", () => {
		expect(lazyArr.debug(2)).toEqual(lazyArr.debug(2));
		expect(array).toEqual(lazyArr.collect());
	});

	const mappedArr = array.map((val, pos) => ({
		element: val,
		cos: Math.cos((Math.PI / 180) * val),
		str: pos.toString(),
	}));
	const mappedLazyArr = lazyArr.map(({ val, pos }) => ({
		element: val,
		cos: Math.cos((Math.PI / 180) * val),
		str: pos.toString(),
	}));
	test("Compare Mapped Lazy Array", () => {
		expect(mappedLazyArr.debug(3)).toEqual(mappedLazyArr.debug(3));
		expect(mappedArr).toEqual(mappedLazyArr.collect());
	});

	const filteredArr = mappedArr.filter((val, pos) => pos % 2 === 0 || val.cos > 0);
	const filteredLazyArr = mappedLazyArr.filter(({ val, pos }) => pos % 2 === 0 || val.cos > 0);

	test("Compare Filtered Lazy Array", () => {
		expect(filteredLazyArr.debug(4)).toEqual(filteredLazyArr.debug(4));
		expect(filteredArr).toEqual(filteredLazyArr.collect());
	});

	const reducedFilteredLazyVal = filteredLazyArr.reduce(
		({ val, collected }) => collected - val.cos * val.element,
		{ collected: 0 }
	);
	const reducedMappedLazyVal = mappedLazyArr.reduce(
		({ val, pos, collected }) =>
			pos % 2 === 0 || val.cos > 0 ? collected - val.cos * val.element : collected,
		{ collected: 0 }
	);
	test("Compare Reduced Values using different constructs", () => {
		expect(reducedFilteredLazyVal).toBeCloseTo(reducedMappedLazyVal);
		expect(
			filteredArr.reduce((collected, val) => collected - val.cos * val.element, 0)
		).toBeCloseTo(reducedFilteredLazyVal);

		expect(
			mappedArr.reduce(
				(collected, val, pos) =>
					pos % 2 === 0 || val.cos > 0 ? collected - val.cos * val.element : collected,
				0
			)
		).toBeCloseTo(reducedMappedLazyVal);
	});

	const roundWalkLazyArr = mappedLazyArr.roundWalk(7, 10);
	const roundWalkArr = arrayRoundWalk(mappedArr, 7, 10);
	test("Compare Round Walk Values using different constructs", () => {
		expect(roundWalkLazyArr.debug(-1)).toEqual(roundWalkLazyArr.debug(-7));
		expect(roundWalkArr).toEqual(roundWalkLazyArr.collect());
	});

	test("Compare Instant Lazy Chaining", () => {
		expect(
			arrayRoundWalk(
				arrayRoundWalk(
					array.filter(
						(val, pos) =>
							pos % 3 === 0 ||
							(Math.tan((Math.PI / 180) * val) > 0 && Math.tan((Math.PI / 180) * val) < 1)
					),
					5,
					8
				).map((val, pos) => ({
					pos: pos.toString(),
					elm: val,
					log: Math.log(val),
				})),
				-9,
				-8
			)
		).toEqual(
			lazyArr
				.map(({ val }) => ({
					elm: val,
					log: Math.log(val),
					tan: Math.tan((Math.PI / 180) * val),
				}))
				.filter(({ val, pos }) => pos % 3 === 0 || (val.tan > 0 && val.tan < 1))
				.roundWalk(5, 8)
				.map(({ val: { elm, log }, pos }) => ({
					pos: pos.toString(),
					elm,
					log,
				}))
				.roundWalk(0, -10)
				.collect()
		);
	});
});
