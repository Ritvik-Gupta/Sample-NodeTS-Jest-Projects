import immer, { immerable } from "immer";
import { Stack } from "./Stack";
import { TreeNode } from "./TreeNode";

export class ParseTree {
	[immerable] = true;

	private head: TreeNode;
	private operStack: Stack<string>;
	private unitStack: Stack<TreeNode>;

	private operator: {
		[key: string]:
			| {
					precedence: number;
					operation: () => void;
			  }
			| undefined;
	};

	constructor(private regExp: string) {
		this.head = new TreeNode(".").addRight(new TreeNode("#"));
		this.operStack = new Stack();
		this.unitStack = new Stack();

		this.operator = {
			"*": {
				precedence: 1,
				operation: this.unaryOperation("*"),
			},
			".": {
				precedence: 2,
				operation: this.binaryOperation("."),
			},
			"+": {
				precedence: 3,
				operation: this.binaryOperation("+"),
			},
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
		this.unitStack.push(new TreeNode(type).addKids(unit1, unit2));
		this.operStack.pop();
	};

	private createTree(): void {
		const applyPrevOper = (): void => {
			const prevOper = this.operator[this.operStack.peek ?? ""];
			if (prevOper !== undefined) prevOper.operation();
		};

		for (const expUnit of this.regExp) {
			const asOperator = this.operator[expUnit];
			if (expUnit === "(") this.operStack.push(expUnit);
			else if (expUnit === ")") {
				while (!this.operStack.isEmpty() && this.operStack.peek !== "(") applyPrevOper();
				this.operStack.pop();
			} else if (asOperator !== undefined) {
				while (!this.operStack.isEmpty() && this.operStack.peek !== "(") {
					const operStackTopPrec = this.operator[this.operStack.peek ?? ""];
					if (operStackTopPrec === undefined || operStackTopPrec.precedence > asOperator.precedence)
						break;
					applyPrevOper();
				}
				this.operStack.push(expUnit);
			} else this.unitStack.push(new TreeNode(expUnit));
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

// const parseTree = new ParseTree("(a+b*).c.a*");
// console.log(JSON.stringify(parseTree.tree, null, "-\t"));
