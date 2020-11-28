import { FiniteStack, Stack } from "../src/Stack";

describe("Creates a Valid Stack", () => {
	const stack = new Stack<number>([1, 2, 4, 5]);

	test("Creates a Blank Array Stack", () => {
		expect(stack.array).toEqual([1, 2, 4, 5]);
	});
});

describe("Creates a Finite Stack and runs Operations", () => {
	const stack = new FiniteStack(5, [10, 20, 30]);

	test("Creates a Size 5 Stack", () => {
		expect(stack.array).toEqual([10, 20, 30]);
		expect(stack.push(1)).toEqual(true);
		expect(stack.push(2)).toEqual(true);
		expect(stack.push(3)).toEqual(false);
		expect(stack.push(4)).toEqual(false);
		expect(stack.push(5)).toEqual(false);
		expect(stack.push(6)).toEqual(false);
		expect(stack.array).toEqual([10, 20, 30, 1, 2]);
	});
});
