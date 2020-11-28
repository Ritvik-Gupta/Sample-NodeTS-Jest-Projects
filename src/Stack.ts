import { produce, immerable } from "immer";

export class Stack<T> {
	readonly [immerable] = true;
	protected top: number;
	protected arr: T[];

	constructor(prevStack?: T[]) {
		this.arr = [];
		this.top = -1;
		if (prevStack !== undefined) prevStack.forEach(el => this.push(el));
	}

	isEmpty(): boolean {
		return this.top === -1;
	}

	push(val: T): boolean {
		this.arr.push(val);
		++this.top;
		return true;
	}

	pop(): T | null {
		if (this.isEmpty()) return null;
		const val = this.arr[this.top--];
		this.arr.pop();
		return val;
	}

	at(pos: number): T | null {
		if (pos > this.top || pos < 0) return null;
		return produce(this.arr[pos], () => {});
	}

	get peek(): T | null {
		if (this.isEmpty()) return null;
		return produce(this.arr[this.top], () => {});
	}

	get array(): T[] {
		return this.arr.map(el => produce(el, () => {}));
	}
}

export class FiniteStack<T> extends Stack<T> {
	constructor(public readonly size: number, prevStack?: T[]) {
		super(prevStack);
	}

	isFull(): boolean {
		return this.top === this.size - 1;
	}

	push(val: T): boolean {
		return !this.isFull() && super.push(val);
	}
}
