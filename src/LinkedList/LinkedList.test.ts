import { LinkedList } from "./LinkedList";

export class LinkedListMock<T> extends LinkedList<T> {
	public get entries(): T[] {
		const entry: T[] = [];
		for (const elm of this.each()) entry.push(elm);
		return entry;
	}
}
