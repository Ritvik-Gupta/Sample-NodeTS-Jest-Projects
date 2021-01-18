import { BPlusList } from "./BPlusNode";

interface IDataset<T> {
	input: T[];
	output: T[];
	normalize(value: T): number;
}

const dataset: IDataset<number>[] = [
	{
		input: [1, 2, 3],
		output: [1, 2, 3],
		normalize: x => x,
	},
	{
		input: [10, 2, 725],
		output: [2, 10, 725],
		normalize: x => x,
	},
	{
		input: [1, -25, 0],
		output: [-25, 0, 1],
		normalize: x => x,
	},
];

describe.each(dataset)(
	"Compare the Output for B+ List for Array (%#)",
	({ normalize, input, output }) => {
		const list = new BPlusList({ branchingFactor: 10, normalize });
		input.forEach(val => list.append(val));
		test("Compare B+ to Array", () => {
			expect(list.array).toEqual(output);
		});
	}
);
