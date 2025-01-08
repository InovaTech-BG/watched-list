export abstract class WatchedList<T> {
	private currentItems: T[];
	private initial: T[];
	private new: T[];
	private removed: T[];

	[index: number]: T;

	constructor(initialItems: T[]) {
		this.currentItems = initialItems ?? [];
		this.initial = initialItems ?? [];
		this.new = [];
		this.removed = [];

		// biome-ignore lint:
		return new Proxy(this, {
			get: (target, prop, receiver) => {
				if (typeof prop === "symbol") {
					return Reflect.get(target, prop, receiver);
				}

				if (prop === "length") {
					return target.currentItems.length;
				}

				const index = Number(prop);
				if (!Number.isNaN(index)) {
					return target.currentItems[index];
				}

				return Reflect.get(target, prop, receiver);
			},

			set: (target, prop, value, receiver) => {
				if (typeof prop === "symbol") {
					return Reflect.set(target, prop, value, receiver);
				}

				const index = Number(prop);
				if (!Number.isNaN(index)) {
					if (index >= 0 && index < target.currentItems.length) {
						const oldItem = target.currentItems[index];
						target.remove(oldItem);
					}

					target.add(value, index);
					return true;
				}

				return Reflect.set(target, prop, value, receiver);
			},
		});
	}

	abstract compareItems(a: T, b: T): boolean;

	public get items(): T[] {
		return this.currentItems;
	}

	public get newItems(): T[] {
		return this.new;
	}

	public get removedItems(): T[] {
		return this.removed;
	}

	public isCurrentItem(item: T): boolean {
		return (
			this.currentItems.filter((currentItem) =>
				this.compareItems(currentItem, item),
			).length !== 0
		);
	}

	private isNewItem(item: T): boolean {
		return (
			this.new.filter((newItem) => this.compareItems(newItem, item)).length !==
			0
		);
	}

	private isRemovedItem(item: T): boolean {
		return (
			this.removed.filter((removedItem) => this.compareItems(removedItem, item))
				.length !== 0
		);
	}

	private removeFromNew(item: T): void {
		this.new = this.new.filter((newItem) => !this.compareItems(newItem, item));
	}

	private removeFromCurrent(item: T): void {
		this.currentItems = this.currentItems.filter(
			(currentItem) => !this.compareItems(currentItem, item),
		);
	}

	private removeFromRemoved(item: T): void {
		this.removed = this.removed.filter(
			(removedItem) => !this.compareItems(removedItem, item),
		);
	}

	private wasAddedIntially(item: T): boolean {
		return (
			this.initial.filter((initialItem) => this.compareItems(initialItem, item))
				.length !== 0
		);
	}

	public add(item: T, index?: number): void {
		if (this.isRemovedItem(item)) {
			this.removeFromRemoved(item);
		}

		if (!this.isNewItem(item) && !this.wasAddedIntially(item)) {
			this.new.push(item);
		}

		if (!this.isCurrentItem(item)) {
			if (index) {
				this.currentItems.splice(index, 0, item);
			} else {
				this.currentItems.push(item);
			}
		}
	}

	public remove(item: T): void {
		this.removeFromCurrent(item);

		if (this.isNewItem(item)) {
			this.removeFromNew(item);

			return;
		}

		if (!this.isRemovedItem(item)) {
			this.removed.push(item);
		}
	}

	public update(items: T[]): void {
		const newItems = items.filter((a) => {
			return !this.items.some(
				(b) => this.compareItems(a, b) && !this.isRemovedItem(a),
			);
		});

		const removedItems = this.items.filter((a) => {
			return !items.some((b) => this.compareItems(a, b)) && !this.isNewItem(a);
		});

		this.currentItems = items;
		this.new = newItems;
		this.removed = removedItems;
	}

	public reset(): void {
		this.currentItems = this.initial;
		this.new = [];
		this.removed = [];
	}

	public get length(): number {
		return this.currentItems.length;
	}

	public map<U, K extends WatchedList<U>>(
		fn: (item: T) => U,
		factory: (items: U[]) => K,
	): K {
		const mappedItems = this.currentItems.map(fn);
		return factory(mappedItems);
	}

	public mapToArray<U>(fn: (item: T) => U): U[] {
		return this.currentItems.map(fn);
	}

	public filter(fn: (item: T) => boolean, selfUpdate?: true): never;
	public filter(fn: (item: T) => boolean, selfUpdate?: false): this;
	public filter(
		fn: (item: T) => boolean,
		selfUpdate: true | false = true,
	): never | this {
		const filteredItems = this.currentItems.filter(fn);
		if (selfUpdate) {
			this.update(filteredItems);
			return this;
		}

		type self = this;
		const ctor = this.constructor as {
			new (items: T[]): self;
		};

		return new ctor(filteredItems);
	}

	public find(item: T): T | undefined;
	public find(fn: (item: T) => boolean): T | undefined;
	public find(fn: T | ((item: T) => boolean)): T | undefined {
		if (fn instanceof Function) {
			return this.currentItems.find(fn);
		}
		return this.currentItems.find((item) => this.compareItems(item, fn));
	}

	public lastFind(item: T): T | undefined;
	public lastFind(fn: (item: T) => boolean): T | undefined;
	public lastFind(fn: T | ((item: T) => boolean)): T | undefined {
		if (fn instanceof Function) {
			return this.currentItems.reverse().find(fn);
		}
		return this.currentItems
			.reverse()
			.find((item) => this.compareItems(item, fn));
	}

	public some(fn: (item: T) => boolean): boolean {
		return this.currentItems.some(fn);
	}

	public every(fn: (item: T) => boolean): boolean {
		return this.currentItems.every(fn);
	}

	public forEach(fn: (item: T, list: this) => void): void {
		for (const item of this.currentItems) {
			fn(item, this);
		}
	}

	public includes(item: T): boolean {
		return this.isCurrentItem(item);
	}

	public deepIncludes(item: T): boolean {
		return this.currentItems.includes(item);
	}

	public indexOf(item: T, fromIndex?: number): number {
		return this.currentItems.indexOf(item, fromIndex);
	}

	public lastIndexOf(item: T, fromIndex?: number): number {
		return this.currentItems.lastIndexOf(
			item,
			fromIndex ?? this.currentItems.length,
		);
	}

	public join(separator?: string): string {
		return this.currentItems.join(separator);
	}

	public slice(start?: number, end?: number): T[] {
		return this.currentItems.slice(start, end);
	}

	public toString(): string {
		return this.currentItems.toString();
	}

	public toLocaleString(): string {
		return this.currentItems.toLocaleString();
	}

	public concat(items: ConcatArray<T>, selfUpdate: true): never;
	public concat(items: ConcatArray<T>, selfUpdate: false): this;
	public concat(items: ConcatArray<T>): never;
	public concat(items: ConcatArray<T>, selfUpdate = true): this | never {
		const finalItems = this.currentItems.concat(items);
		if (selfUpdate) {
			this.update(finalItems);
			return this;
		}

		type self = this;
		const ctor = this.constructor as {
			new (_items: T[]): self;
		};

		return new ctor(finalItems);
	}
}

export type WatchedListConstructor<T> = {
	new (initialItems: T[]): WatchedList<T>;
};

export type WatchedListValue<T> = T extends WatchedList<infer U> ? U : never;
