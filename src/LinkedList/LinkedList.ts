import { Int, Unsigned, Validate } from "../assets";

type connectionPosition = "next" | "prev";

export class LinkedNode<T> {
	public next: LinkedNode<T> | null;
	public prev: LinkedNode<T> | null;

	public constructor(public value: T) {
		this.next = null;
		this.prev = null;
	}

	public connect(node: LinkedNode<T>, connectionPos: connectionPosition): void {
		switch (connectionPos) {
			case "next": {
				[node.prev, this.next] = [this, node];
				break;
			}
			case "prev": {
				[this.prev, node.next] = [node, this];
				break;
			}
		}
	}

	public disconnect(connectionPos: connectionPosition): LinkedNode<T> | null {
		switch (connectionPos) {
			case "next": {
				const nextNode = this.next;
				if (nextNode !== null) nextNode.prev = null;
				this.next = null;
				return nextNode;
			}
			case "prev": {
				const prevNode = this.prev;
				if (prevNode !== null) prevNode.next = null;
				this.prev = null;
				return prevNode;
			}
		}
	}
}

type listBehaviour = "stack" | "queue" | "reversed-stack" | "reversed-queue";
type listOperationPosition = "front" | "back" | number;

export class LinkedList<T> {
	private head: LinkedNode<T> | null;
	private tail: LinkedNode<T> | null;
	private size: number;

	public constructor(private readonly defaultBehaviour: listBehaviour = "stack", arr?: T[]) {
		this.head = null;
		this.tail = null;
		this.size = 0;

		if (arr !== undefined) arr.forEach(elm => this.insert(elm));
	}

	public get length(): number {
		return this.size;
	}

	public *each(): Generator<T, void> {
		let currentNode = this.head;
		while (currentNode !== null) {
			yield currentNode.value;
			currentNode = currentNode.next;
		}
	}

	private pushHead(value: T): void {
		const node = new LinkedNode(value);
		if (this.head === null) [this.head, this.tail] = [node, node];
		else {
			this.head.connect(node, "prev");
			this.head = this.head.prev;
		}
	}

	private pushTail(value: T): void {
		const node = new LinkedNode(value);
		if (this.tail === null) [this.head, this.tail] = [node, node];
		else {
			this.tail.connect(node, "next");
			this.tail = this.tail.next;
		}
	}

	@Validate
	private pushMiddle(value: T, @Unsigned @Int insertPos: number): void {
		if (insertPos < 0 || insertPos > this.size) throw RangeError("List Index Out of Bounds");

		if (insertPos === 0) return this.pushHead(value);
		if (insertPos === this.size) return this.pushTail(value);

		let prevNode = this.head,
			currentPos = 1;
		while (prevNode !== null) {
			if (currentPos === insertPos) break;
			prevNode = prevNode.next;
			++currentPos;
		}

		if (prevNode === null) throw Error("Unknown Error Previous Node is Null");
		const nextNode = prevNode.next;
		if (nextNode === null) throw Error("Unknown Error Next Node is Null");

		const node = new LinkedNode(value);
		prevNode.connect(node, "next");
		nextNode.connect(node, "prev");
	}

	public insert(value: T, operationPos?: listOperationPosition): void {
		++this.size;
		switch (operationPos) {
			case undefined: {
				switch (this.defaultBehaviour) {
					case "reversed-stack":
					case "reversed-queue":
						return this.pushHead(value);

					case "stack":
					case "queue":
						return this.pushTail(value);
				}
			}
			case "front":
				return this.pushHead(value);

			case "back":
				return this.pushTail(value);

			default:
				return this.pushMiddle(value, operationPos);
		}
	}

	private popHead(): T {
		if (this.head === null) throw RangeError("List is Empty ( NULL HEAD )");
		const { value } = this.head;
		this.head = this.head.disconnect("next");
		if (this.head === null) this.tail = null;
		return value;
	}

	private popTail(): T {
		if (this.tail === null) throw RangeError("List is Empty ( NULL TAIL )");
		const { value } = this.tail;
		this.tail = this.tail.disconnect("prev");
		if (this.tail === null) this.head = null;
		return value;
	}

	@Validate
	private popMiddle(@Unsigned @Int deletePos: number): T {
		if (deletePos < 0 || deletePos >= this.size) throw RangeError("List Index Out of Bounds");

		if (deletePos === 0) return this.popHead();
		if (deletePos === this.size - 1) return this.popTail();

		let currentNode = this.head,
			currentPos = 0;
		while (currentNode !== null) {
			if (currentPos === deletePos) break;
			currentNode = currentNode.next;
			++currentPos;
		}

		if (currentNode === null) throw Error("Unknown Error Current Node is Null");
		const prevNode = currentNode.prev;
		if (prevNode === null) throw Error("Unknown Error Previous Node is Null");
		const nextNode = currentNode.next;
		if (nextNode === null) throw Error("Unknown Error Next Node is Null");

		prevNode.connect(nextNode, "next");
		return currentNode.value;
	}

	public delete(operationPos?: listOperationPosition): T {
		--this.size;
		switch (operationPos) {
			case undefined: {
				switch (this.defaultBehaviour) {
					case "reversed-stack":
					case "queue":
						return this.popHead();

					case "stack":
					case "reversed-queue":
						return this.popTail();
				}
			}
			case "front":
				return this.popHead();

			case "back":
				return this.popTail();

			default:
				return this.popMiddle(operationPos);
		}
	}
}
