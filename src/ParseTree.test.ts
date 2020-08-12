import ParseTree, { TreeNode } from './ParseTree';

describe(`Creating a Parse Tree r = "(a+b*).c.a*"`, () => {
	const parseTree = new ParseTree('(a+b*).c.a*');
	const tree = new TreeNode('.')
		.left(
			new TreeNode('.').children(
				new TreeNode('.').children(
					new TreeNode('+').children(
						new TreeNode('a'),
						new TreeNode('*').left(new TreeNode('b'))
					),
					new TreeNode('c')
				),
				new TreeNode('*').left(new TreeNode('a'))
			)
		)
		.right(new TreeNode('#'));

	test(`Parse Tree is Not Null`, () => {
		expect(parseTree).not.toBeNull();
	});

	test(`Parse Tree is Valid`, () => {
		expect(parseTree.tree).toEqual(tree);
	});
});
