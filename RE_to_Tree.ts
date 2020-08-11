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
	private head: TreeNode;

	constructor(private regExp: string) {
		this.head = {
			value: '.',
			left: null,
			right: { value: '#', left: null, right: null },
		};
		this.createTree();
	}

	private createTree(): boolean {
		const operStack: Stack<string> = new Stack(this.regExp.length);
		const unitStack: Stack<TreeNode> = new Stack(this.regExp.length);

		const unaryOperation = (type: string) => (): void => {
			const unit = unitStack.pop();
			unitStack.push({ value: type, left: unit, right: null });
			operStack.pop();
		};

		const binaryOperation = (type: string) => (): void => {
			const unit2 = unitStack.pop();
			const unit1 = unitStack.pop();
			unitStack.push({ value: type, left: unit1, right: unit2 });
			operStack.pop();
		};

		const operators: Map<string, { pos: number; apply: () => void }> = new Map([
			['*', { pos: 1, apply: unaryOperation('*') }],
			['.', { pos: 2, apply: binaryOperation('.') }],
			['+', { pos: 3, apply: binaryOperation('+') }],
		]);

		for (let r of this.regExp) {
			if (r === '(') {
				operStack.push(r);
			} else if (r === ')') {
				while (!operStack.isEmpty() && operStack.peek !== '(') {
					const prevOper = operators.get(operStack.peek ?? '');
					if (prevOper === undefined) return false;
					prevOper.apply();
				}
				operStack.pop();
			} else if (operators.has(r)) {
				const operPos = operators.get(r)?.pos ?? -1;
				while (!operStack.isEmpty() && operStack.peek !== '(') {
					const prevOperPos = operators.get(operStack.peek ?? '')?.pos ?? -1;
					if (prevOperPos > operPos) break;
					const prevOper = operators.get(operStack.peek ?? '');
					if (prevOper === undefined) return false;
					prevOper.apply();
				}
				operStack.push(r);
			} else {
				unitStack.push({ value: r, left: null, right: null });
			}
		}

		while (!operStack.isEmpty()) {
			const prevOper = operators.get(operStack.peek ?? '');
			if (prevOper === undefined) return false;
			else prevOper.apply();
		}

		this.head.left = unitStack.array[0];
		return true;
	}

	get tree(): TreeNode {
		return this.head;
	}
}
