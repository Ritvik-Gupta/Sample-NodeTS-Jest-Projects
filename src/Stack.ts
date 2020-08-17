import immer, { immerable } from "immer";

class Stack<genType = number | string | boolean> {
	[immerable] = true;

	protected top: number;
	protected arr: Array<genType | null>;

	constructor(arr?: Array<genType>) {
		this.arr = [];
		this.top = -1;
		if (arr !== undefined) arr.forEach(el => this.push(el));
	}

	isEmpty(): boolean {
		return this.top === -1;
	}

	push(val: genType): boolean {
		this.arr.push(val);
		++this.top;
		return true;
	}

	pop(): genType | null {
		if (this.isEmpty()) return null;
		const val = this.arr[this.top--];
		this.arr.pop();
		return val;
	}

	at(pos: number): genType | null {
		if (pos > this.top || pos < 0) return null;
		return immer(this.arr[pos], () => {});
	}

	get peek(): genType | null {
		if (this.isEmpty()) return null;
		return immer(this.arr[this.top], () => {});
	}

	get array(): Array<genType | null> {
		return immer(this.arr, () => {});
	}
}

class FiniteStack<genType = number | string | boolean> extends Stack<genType> {
	readonly size: number;
	constructor(size: number, arr?: Array<genType>) {
		super(arr);
		this.size = size;
	}

	isFull(): boolean {
		return this.top === this.size - 1;
	}

	push(val: genType): boolean {
		if (this.isFull()) return false;
		super.push(val);
		return true;
	}
}

export { Stack, FiniteStack };
