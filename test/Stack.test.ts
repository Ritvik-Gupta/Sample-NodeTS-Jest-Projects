import { Stack } from "../src/Stack";

describe("Creates a Valid Stack", () => {
	const stack = new Stack<number>(10);
	const array: Array<any> = new Array(10).fill(null);

	test("Creates a Blank Array Stack", () => {
		expect(stack.array).toEqual(array);
	});
});
