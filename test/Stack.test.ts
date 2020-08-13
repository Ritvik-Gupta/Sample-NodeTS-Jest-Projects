import { Stack, FiniteStack } from "../src/Stack";

describe("Creates a Valid Stack", () => {
	const stack = new FiniteStack<number>(10);

	test("Creates a Blank Array Stack", () => {
		expect(stack.array).toEqual([]);
	});
});
