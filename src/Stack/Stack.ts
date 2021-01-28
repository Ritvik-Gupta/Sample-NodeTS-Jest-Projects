export class Stack<T> {
	protected readonly arr: T[];

	public constructor(prevStack?: T[]) {
		this.arr = [];
		if (prevStack !== undefined) prevStack.forEach(elm => this.push(elm));
	}

	public isEmpty(): boolean {
		return this.arr.length === 0;
	}

	public push(val: T): boolean {
		this.arr.push(val);
		return true;
	}

	public pop(): T | null {
		if (this.isEmpty()) return null;
		return this.arr.pop() ?? null;
	}

	public at(pos: number): T | null {
		return this.arr[pos] ?? null;
	}

	public get length(): number {
		return this.arr.length;
	}

	public get peek(): T | null {
		if (this.isEmpty()) return null;
		return this.arr[this.arr.length - 1] ?? null;
	}
}

export class FiniteStack<T> extends Stack<T> {
	constructor(public readonly size: number, prevStack?: T[]) {
		super(prevStack);
	}

	public isFull(): boolean {
		return this.arr.length === this.size;
	}

	public push(val: T): boolean {
		return !this.isFull() && super.push(val);
	}
}
