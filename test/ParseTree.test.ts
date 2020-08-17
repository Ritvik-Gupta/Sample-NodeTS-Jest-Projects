import { TreeNode } from "../src/TreeNode";
import { ParseTree } from "../src/ParseTree";

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
