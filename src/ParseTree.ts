import immer, { immerable } from "immer";

import { TreeNode } from "./TreeNode";
import { Stack } from "./Stack";

class ParseTree {
	[immerable] = true;

	private head: TreeNode;
	private operStack: Stack<string>;
	private unitStack: Stack<TreeNode>;

	private operator: {
		[key: string]: {
			precedence: number;
			operation: () => void;
		};
	};

	constructor(private regExp: string) {
		this.head = new TreeNode(".").addRight(new TreeNode("#"));
		this.operStack = new Stack();
		this.unitStack = new Stack();

		this.operator = {};
		this.operator["*"] = {
			precedence: 1,
			operation: this.unaryOperation("*"),
		};
		this.operator["."] = {
			precedence: 2,
			operation: this.binaryOperation("."),
		};
		this.operator["+"] = {
			precedence: 3,
			operation: this.binaryOperation("+"),
		};

		this.createTree();
	}

	private unaryOperation = (type: string) => (): void => {
		const unit = this.unitStack.pop();
		this.unitStack.push(new TreeNode(type).addLeft(unit));
		this.operStack.pop();
	};

	private binaryOperation = (type: string) => (): void => {
		const unit2 = this.unitStack.pop();
		const unit1 = this.unitStack.pop();
		this.unitStack.push(new TreeNode(type).addChildren([unit1, unit2]));
		this.operStack.pop();
	};

	private createTree(): void {
		const applyPrevOper = (): void => {
			const prevOper = this.operator[this.operStack.peek ?? ""];
			if (prevOper !== undefined) prevOper.operation();
		};

		for (let reu of this.regExp) {
			if (reu === "(") this.operStack.push(reu);
			else if (reu === ")") {
				while (!this.operStack.isEmpty() && this.operStack.peek !== "(")
					applyPrevOper();
				this.operStack.pop();
			} else if (this.operator[reu] !== undefined) {
				const operPrecedence = this.operator[reu].precedence;
				while (
					!this.operStack.isEmpty() &&
					this.operStack.peek !== "(" &&
					this.operator[this.operStack.peek ?? ""].precedence <= operPrecedence
				)
					applyPrevOper();
				this.operStack.push(reu);
			} else this.unitStack.push(new TreeNode(reu));
		}

		while (!this.operStack.isEmpty()) applyPrevOper();
		this.head.addLeft(this.unitStack.at(0));
	}

	checkTree(node: TreeNode = this.head): boolean {
		if (node.left !== null && this.checkTree(node.left) === false) return false;
		if (TreeNode.isValid(node) === false) return false;
		if (node.right !== null && this.checkTree(node.right) === false) return false;

		return true;
	}

	get tree(): TreeNode {
		return immer(this.head, () => {});
	}
}

export { ParseTree };

// const parseTree = new ParseTree("(a+b*).c.a*");
// console.log(JSON.stringify(parseTree.tree, null, "-\t"));
