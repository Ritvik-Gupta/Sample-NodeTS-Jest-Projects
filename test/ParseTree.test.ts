import { TreeNode } from "../src/TreeNode";
import { ParseTree } from "../src/ParseTree";

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

describe(`Creating a Parse Tree r = "(a+b*).c.a*"`, () => {
	const parseTree = new ParseTree("(a+b*).c.a*");
	const tree = new TreeNode(".")
		.addLeft(
			new TreeNode(".").addChildren([
				new TreeNode(".").addChildren([
					new TreeNode("+").addChildren([
						new TreeNode("a"),
						new TreeNode("*").addLeft(new TreeNode("b")),
					]),
					new TreeNode("c"),
				]),
				new TreeNode("*").addLeft(new TreeNode("a")),
			])
		)
		.addRight(new TreeNode("#"));

	test(`Parse Tree is Valid`, () => {
		expect(parseTree.tree).toEqual(tree);
	});

	test(`Parse Tree is Valid`, () => {
		expect(parseTree.checkTree()).toEqual(true);
	});
});
