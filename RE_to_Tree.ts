interface TreeNode {
	value: string;
	left: TreeNode | null;
	right: TreeNode | null;
}

const node: TreeNode = {
	value: 'something',
	left: null,
	right: {
		value: 'svnsk',
		left: { value: 'ritvik', left: null, right: null },
		right: null,
	},
};

export default node;
