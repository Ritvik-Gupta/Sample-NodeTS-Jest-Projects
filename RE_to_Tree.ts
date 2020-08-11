export class Stack<genType = number | string | boolean> {
	private top: number;
	private arr: Array<genType | null>;

	constructor(private size: number, arr?: Array<genType>) {
		this.arr = new Array(this.size).fill(null);
		this.top = -1;
		if (arr !== undefined) arr.forEach(el => this.push(el));
	}

	isFull(): boolean {
		return this.top === this.size - 1;
	}

	isEmpty(): boolean {
		return this.top === -1;
	}

	push(val: genType): boolean {
		if (this.isFull()) return false;
		this.arr[++this.top] = val;
		return true;
	}

	pop(): genType | null {
		if (this.isEmpty()) return null;
		const val = this.arr[this.top];
		this.arr[this.top--] = null;
		return val;
	}

	get peek(): genType | null {
		if (this.isEmpty()) return null;
		return this.arr[this.top];
	}

	get array(): Array<genType | null> {
		return [...this.arr];
	}
}

export interface TreeNode {
	value: string;
	left: TreeNode | null;
	right: TreeNode | null;
}

export class ParseTree {
	private head: TreeNode = {
		value: '.',
		left: null,
		right: { value: '#', left: null, right: null },
	};

	constructor(private regExp: string) {
		this.createTree();
	}

	private createTree(): void {
		const operStack: Stack<string> = new Stack(this.regExp.length);
		const unitStack: Stack<TreeNode> = new Stack(this.regExp.length);

		const operatorsPrec: Map<string, number> = new Map([
			['*', 1],
			['.', 2],
			['+', 3],
		]);

		const operators: Map<string, () => void> = new Map([
			[
				'*',
				() => {
					const unit = unitStack.pop();
					unitStack.push({ value: '*', left: unit, right: null });
					operStack.pop();
				},
			],
			[
				'.',
				() => {
					const unit2 = unitStack.pop();
					const unit1 = unitStack.pop();
					unitStack.push({ value: '.', left: unit1, right: unit2 });
					operStack.pop();
				},
			],
			[
				'+',
				() => {
					const unit2 = unitStack.pop();
					const unit1 = unitStack.pop();
					unitStack.push({ value: '+', left: unit1, right: unit2 });
					operStack.pop();
				},
			],
		]);

		for (let r of this.regExp) {
			if (r === '(') {
				operStack.push(r);
			} else if (operatorsPrec.has(r)) {
				const operPrec = operatorsPrec.get(r);
				while (true) {
					const prevOper = operStack.peek === null ? '' : operStack.peek;
					const prevOperPrec = operatorsPrec.get(prevOper);

					if (prevOperPrec === undefined || operPrec === undefined) break;
					if (prevOperPrec > operPrec) break;

					const getUnit = operators.get(prevOper);
					if (getUnit !== undefined) getUnit();
				}
				operStack.push(r);
			} else if (r === ')') {
				while (!operStack.isEmpty() && operStack.peek !== '(') {
					const prevOper = operStack.peek === null ? '' : operStack.peek;
					const getUnit = operators.get(prevOper);
					if (getUnit !== undefined) getUnit();
				}
				operStack.pop();
			} else {
				unitStack.push({ value: r, left: null, right: null });
			}
		}

		while (!operStack.isEmpty()) {
			const prevOper = operStack.peek === null ? '' : operStack.peek;
			const getUnit = operators.get(prevOper);
			if (getUnit !== undefined) getUnit();
		}

		console.log(unitStack);
		console.log(operStack);
	}

	static isValidRegExp(regExp: string): boolean {
		return /^[a-z]\*?[.+][a-z]\*?$/i.test(regExp);
	}

	get tree(): TreeNode {
		return this.head;
	}
}
