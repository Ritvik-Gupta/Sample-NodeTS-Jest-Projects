import immer from 'immer';

class Stack<genType = number | string | boolean> {
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

	at(pos: number): genType | null {
		if (pos > this.size || pos < 0) return null;
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

export default Stack;
