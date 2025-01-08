export abstract class WacthedList<T> {
  private currentItems: T[]
  private initial: T[]
  private new: T[]
  private removed: T[]

  constructor(initialItems: T[]) {
    this.currentItems = initialItems ?? []
    this.initial = initialItems ?? []
    this.new = []
    this.removed = []
  }

  abstract compareItems(a: T, b: T): boolean

  public get items(): T[] {
    return this.currentItems
  }

  public get newItems(): T[] {
    return this.new
  }

  public get removedItems(): T[] {
    return this.removed
  }

  public isCurrentItem(item: T): boolean {
    return (
      this.currentItems.filter(
        (currentItem) => this.compareItems(currentItem, item)
      ).length !== 0
    )
  }

  private isNewItem(item: T): boolean {
    return (
      this.new.filter((newItem) => this.compareItems(newItem, item)).length !== 0
    )
  }

  private isRemovedItem(item: T): boolean {
    return (
      this.removed.filter((removedItem) => this.compareItems(removedItem, item))
        .length !== 0
    )
  }

  private removeFromNew(item: T): void {
    this.new = this.new.filter((newItem) => !this.compareItems(newItem, item))
  }

  private removeFromCurrent(item: T): void {
    this.currentItems = this.currentItems.filter(
      (currentItem) => !this.compareItems(currentItem, item)
    )
  }

  private removeFromRemoved(item: T): void {
    this.removed = this.removed.filter(
      (removedItem) => !this.compareItems(removedItem, item)
    )
  }

  private wasAddedIntially(item: T): boolean {
    return (
      this.initial.filter((initialItem) => this.compareItems(initialItem, item))
        .length !== 0
    )
  }

  public add(item: T): void {
    if(this.isRemovedItem(item)) {
      this.removeFromRemoved(item)
    }

    if (!this.isNewItem(item) && !this.isCurrentItem(item)) {
      this.new.push(item)
    }

    if (!this.isCurrentItem(item)) {
      this.currentItems.push(item)
    }
  }

  public remove(item: T): void {
    this.removeFromCurrent(item)

    if(this.isNewItem(item)) {
      this.removeFromNew(item)

      return 
    }

    if(!this.isRemovedItem(item)) {
      this.removed.push(item)
    }
  }

  public update(items: T[]): void {
    const newItems = items.filter((a) => {
			return !this.items.some((b) => this.compareItems(a, b));
		});

		const removedItems = this.items.filter((a) => {
			return !items.some((b) => this.compareItems(a, b));
		});

    this.currentItems = items
    this.new = newItems
    this.removed = removedItems
  }

  public reset(): void {
    this.currentItems = this.initial
    this.new = []
    this.removed = []
  }

  public map<U>(fn: (item: T) => U): U[] {
    return this.currentItems.map(fn)
  }

  public filter(fn: (item: T) => boolean): T[] {
    return this.currentItems.filter(fn)
  }

  public find(fn: (item: T) => boolean): T | undefined {
    return this.currentItems.find(fn)
  }

  public some(fn: (item: T) => boolean): boolean {
    return this.currentItems.some(fn)
  }

  public every(fn: (item: T) => boolean): boolean {
    return this.currentItems.every(fn)
  }

  public forEach(fn: (item: T) => void): void {
    this.currentItems.forEach(fn)
  }

  public includes(item: T): boolean {
    return this.currentItems.includes(item)
  }

  public indexOf(item: T): number {
    return this.currentItems.indexOf(item)
  }

  public lastIndexOf(item: T): number {
    return this.currentItems.lastIndexOf(item)
  }

  public join(separator?: string): string {
    return this.currentItems.join(separator)
  }

  public slice(start?: number, end?: number): T[] {
    return this.currentItems.slice(start, end)
  }

  public toString(): string {
    return this.currentItems.toString()
  }

  public toLocaleString(): string {
    return this.currentItems.toLocaleString()
  }

  public concat(...items: ConcatArray<T>[]): T[] {
    return this.currentItems.concat(...items)
  }
}

export type WacthedListValue<T> = T extends WacthedList<infer U> ? U : never