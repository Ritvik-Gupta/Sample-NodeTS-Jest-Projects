type connectionPosition = "next" | "prev"

export class LinkedNode<T> {
	public next: LinkedNode<T> | null
	public prev: LinkedNode<T> | null

	public constructor(public value: T) {
		this.next = null
		this.prev = null
	}

	public connect(node: LinkedNode<T>, connectionPos: connectionPosition): void {
		switch (connectionPos) {
			case "next": {
				;[node.prev, this.next] = [this, node]
				break
			}
			case "prev": {
				;[node.next, this.prev] = [this, node]
				break
			}
		}
	}

	public disconnect(connectionPos: connectionPosition): LinkedNode<T> | null {
		switch (connectionPos) {
			case "next": {
				const nextNode = this.next
				if (nextNode !== null) nextNode.prev = null
				this.next = null
				return nextNode
			}
			case "prev": {
				const prevNode = this.prev
				if (prevNode !== null) prevNode.next = null
				this.prev = null
				return prevNode
			}
		}
	}
}
