import { Int, Unsigned, Validate } from "@/assets"
import { LinkedNode } from "./LinkedNode"

export type listBehaviour = "stack" | "queue" | "reversed-stack" | "reversed-queue"
type listOperationPosition = "front" | "back" | number

export class LinkedList<T> {
	private head: LinkedNode<T> | null
	private tail: LinkedNode<T> | null
	private size: number

	public constructor(private readonly defaultBehaviour: listBehaviour, arr?: T[]) {
		this.head = null
		this.tail = null
		this.size = 0
		arr?.forEach(elm => this.insert(elm))
	}

	public get length(): number {
		return this.size
	}

	public *each(): Generator<T, void> {
		let currentNode = this.head
		while (currentNode !== null) {
			yield currentNode.value
			currentNode = currentNode.next
		}
	}

	private pushHead(value: T): void {
		const node = new LinkedNode(value)
		if (this.head === null) [this.head, this.tail] = [node, node]
		else {
			this.head.connect(node, "prev")
			this.head = this.head.prev
		}
	}

	private pushTail(value: T): void {
		const node = new LinkedNode(value)
		if (this.tail === null) [this.head, this.tail] = [node, node]
		else {
			this.tail.connect(node, "next")
			this.tail = this.tail.next
		}
	}

	@Validate
	private pushMiddle(value: T, @Unsigned @Int insertPos: number): void {
		if (insertPos < 0 || insertPos > this.size) throw RangeError("List Index Out of Bounds")

		if (insertPos === 0) return this.pushHead(value)
		if (insertPos === this.size) return this.pushTail(value)

		let prevNode = this.head,
			currentPos = 1
		while (prevNode !== null) {
			if (currentPos === insertPos) break
			prevNode = prevNode.next
			++currentPos
		}

		const nextNode = prevNode!.next
		const node = new LinkedNode(value)
		prevNode!.connect(node, "next")
		nextNode!.connect(node, "prev")
	}

	public insert(value: T, operationPos?: listOperationPosition): void {
		switch (operationPos) {
			case undefined:
				switch (this.defaultBehaviour) {
					case "reversed-stack":
					case "reversed-queue":
						this.pushHead(value)
						break
					case "stack":
					case "queue":
						this.pushTail(value)
						break
				}
				break
			case "front":
				this.pushHead(value)
				break
			case "back":
				this.pushTail(value)
				break
			default:
				this.pushMiddle(value, operationPos)
				break
		}

		++this.size
	}

	private popHead(): T {
		if (this.head === null) throw RangeError("List is Empty ( NULL HEAD )")
		const { value } = this.head
		this.head = this.head.disconnect("next")
		if (this.head === null) this.tail = null
		return value
	}

	private popTail(): T {
		if (this.tail === null) throw RangeError("List is Empty ( NULL TAIL )")
		const { value } = this.tail
		this.tail = this.tail.disconnect("prev")
		if (this.tail === null) this.head = null
		return value
	}

	@Validate
	private popMiddle(@Unsigned @Int deletePos: number): T {
		if (deletePos < 0 || deletePos >= this.size) throw RangeError("List Index Out of Bounds")

		if (deletePos === 0) return this.popHead()
		if (deletePos === this.size - 1) return this.popTail()

		let currentNode = this.head,
			currentPos = 0
		while (currentNode !== null) {
			if (currentPos === deletePos) break
			currentNode = currentNode.next
			++currentPos
		}

		const prevNode = currentNode!.prev
		const nextNode = currentNode!.next
		prevNode!.connect(nextNode!, "next")
		return currentNode!.value
	}

	public delete(operationPos?: listOperationPosition): T {
		let value: T
		switch (operationPos) {
			case undefined:
				switch (this.defaultBehaviour) {
					case "reversed-stack":
					case "queue":
						value = this.popHead()
						break
					case "stack":
					case "reversed-queue":
						value = this.popTail()
						break
				}
				break
			case "front":
				value = this.popHead()
				break
			case "back":
				value = this.popTail()
				break
			default:
				value = this.popMiddle(operationPos)
				break
		}

		--this.size
		return value
	}
}
