import { LazyArray } from "../src/LazyArray";

describe(`Compare the Responses for Normal and Lazy Array Implementation`, () => {
	const arr = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];
	const lazyArr = LazyArray.create(arr);

	test(`Blank Compare`, () => {
		expect(arr).toEqual(lazyArr.collect());
	});

	test(`Compare Lazy Array Copies`, () => {
		expect(lazyArr.collect()).toEqual(lazyArr.collect());
	});
});
