import { TreeNode } from "../src/TreeNode";

const checkUnitValidity: Array<{
	regExp: string;
	tree: TreeNode;
	valid: boolean;
}> = [
	{
		regExp: "(a+b)",
		tree: new TreeNode(".").addChildren([new TreeNode("a"), new TreeNode("b")]),
		valid: true,
	},
	{
		regExp: "(a*+b*)",
		tree: new TreeNode(".").addChildren([
			new TreeNode("*").addLeft(new TreeNode("a")),
			new TreeNode("*").addLeft(new TreeNode("b")),
		]),
		valid: true,
	},
];

describe(`Checking Unit Validity for a Unit of Parse Tree`, () => {
	checkUnitValidity.forEach(unit => {
		test(`r = "${unit.regExp}" is Valid`, () => {
			expect(TreeNode.isValid(unit.tree)).toBe(unit.valid);
		});
	});
});
