export class LinkedListNode<T> {
	next: LinkedListNode<T> | null = null;
	previous: LinkedListNode<T> | null = null;

	constructor(public value: T, next: LinkedListNode<T> | null = null, previous: LinkedListNode<T> | null = null) {
		this.next = next;
		this.previous = previous;
	}
}

export class LinkedList<T> {
	head: LinkedListNode<T> | null = null;
	tail: LinkedListNode<T> | null = null;

	/**
	 *
	 * @param value
	 * @returns
	 */
	public get(value: T): LinkedListNode<T> | null {
		let current = this.head;
		while (current?.value !== value && current?.next) {
			current = current?.next;
		}

		return current?.value === value ? current : null;
	}

	/**
	 *
	 * @param value
	 */
	public insert(value: T): void {
		const node = new LinkedListNode(value);
		if (!this.head) {
			this.head = node;
			this.tail = node;
		} else {
			this.tail!.next = node;
			node.previous = this.tail!;
			this.tail = node;
		}
	}

	/**
	 *
	 * @param value
	 */
	public remove(value: T): void {
		const node = this.get(value);
		if (!node) {
			return undefined;
		}

		if (node === this.head) {
			this.head = node.next;
		}

		if (node === this.tail) {
			this.tail = node.previous;
		}

		if (node.previous) {
			node.previous.next = node.next;
		}

		if (node.next) {
			node.next.previous = node.previous;
		}
	}
}
