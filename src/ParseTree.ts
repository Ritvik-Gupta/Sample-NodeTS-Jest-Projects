import immer, { immerable } from 'immer';

import Stack from './Stack';

export class TreeNode {
	[immerable] = true;
	private leftChild: TreeNode | null;
	private rightChild: TreeNode | null;

	constructor(private value: string) {
		this.leftChild = null;
		this.rightChild = null;
	}

	left(left: TreeNode | null): TreeNode {
		this.leftChild = left;
		return this;
	}

	right(right: TreeNode | null): TreeNode {
		this.rightChild = right;
		return this;
	}

	children(left: TreeNode | null, right: TreeNode | null): TreeNode {
		this.leftChild = left;
		this.rightChild = right;
		return this;
	}
}

export default class ParseTree {
	[immerable] = true;
	private head: TreeNode;

	constructor(private regExp: string) {
		this.head = new TreeNode('.').right(new TreeNode('#'));
		this.createTree();
	}

	private createTree(): void {
		const operStack: Stack<string> = new Stack(this.regExp.length);
		const unitStack: Stack<TreeNode> = new Stack(this.regExp.length);

		const unaryOperation = (type: string) => (): void => {
			unitStack.push(new TreeNode(type).left(unitStack.pop()));
			operStack.pop();
		};

		const binaryOperation = (type: string) => (): void => {
			unitStack.push(
				new TreeNode(type).right(unitStack.pop()).left(unitStack.pop())
			);
			operStack.pop();
		};

		const applyPrevOper = (): void => {
			const prevOper = operators.get(operStack.peek ?? '');
			if (prevOper !== undefined) prevOper.apply();
		};

		const operators: Map<string, { pos: number; apply: () => void }> = new Map([
			['*', { pos: 1, apply: unaryOperation('*') }],
			['.', { pos: 2, apply: binaryOperation('.') }],
			['+', { pos: 3, apply: binaryOperation('+') }],
		]);

		for (let r of this.regExp) {
			if (r === '(') operStack.push(r);
			else if (r === ')') {
				while (!operStack.isEmpty() && operStack.peek !== '(') applyPrevOper();
				operStack.pop();
			} else if (operators.has(r)) {
				const operPos = operators.get(r)?.pos ?? -1;
				while (
					!operStack.isEmpty() &&
					operStack.peek !== '(' &&
					(operators.get(operStack.peek ?? '')?.pos ?? -1) <= operPos
				)
					applyPrevOper();
				operStack.push(r);
			} else unitStack.push(new TreeNode(r));
		}

		while (!operStack.isEmpty()) applyPrevOper();
		this.head.left(unitStack.at(0));
	}

	get tree(): TreeNode {
		return immer(this.head, () => {});
	}
}

// const parseTree = new ParseTree('(a+b*).c.a*');
// console.log(JSON.stringify(parseTree.tree, null, '-\t'));
