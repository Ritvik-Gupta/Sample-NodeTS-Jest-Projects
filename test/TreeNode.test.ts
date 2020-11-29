import { TreeNode } from "../src/re-to-dfa/TreeNode";

const checkUnitValidity: Array<{
	regExp: string;
	tree: TreeNode;
	valid: boolean;
}> = [
	{
		regExp: "(a+b)",
		tree: new TreeNode("+").addKids(new TreeNode("a"), new TreeNode("b")),
		valid: true,
	},
	{
		regExp: "(a*+b*)",
		tree: new TreeNode("+").addKids(
			new TreeNode("*").addLeft(new TreeNode("a")),
			new TreeNode("*").addLeft(new TreeNode("b"))
		),
		valid: true,
	},
];

describe(`Checking Unit Validity for a Unit of Parse Tree`, () => {
	checkUnitValidity.forEach(({ regExp, tree, valid }) => {
		test(`r = "${regExp}" is Valid`, () => {
			expect(TreeNode.isValid(tree)).toBe(valid);
		});
	});
});
