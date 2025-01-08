import { WacthedList } from "./watched-list";

class NumberList extends WacthedList<number> {
	compareItems(a: number, b: number): boolean {
		return a === b;
	}
}

describe("WatchedList Core", () => {
	it("should be able to create a watched list with initial values", () => {
		const list = new NumberList([1, 2, 3]);
		expect(list).toHaveLength(3);
		expect(list.items).toEqual(expect.arrayContaining([1, 2, 3]));
	});

	it("should be able to add new items to the list", () => {
		const list = new NumberList([1, 2, 3]);

		list.add(4);

		expect(list).toHaveLength(4);
		expect(list.items).toEqual(expect.arrayContaining([1, 2, 3, 4]));
		expect(list.newItems).toHaveLength(1);
		expect(list.newItems).toEqual(expect.arrayContaining([4]));
	});

	it("should be able to remove items from the list", () => {
		const list = new NumberList([1, 2, 3]);

		list.remove(2);

		expect(list).toHaveLength(2);
		expect(list.items).toEqual(expect.arrayContaining([1, 3]));
		expect(list.removedItems).toHaveLength(1);
		expect(list.removedItems).toEqual(expect.arrayContaining([2]));
	});

	it("should be able to add an item even if it was remvoed before", () => {
		const list = new NumberList([1, 2, 3]);

		list.remove(2);

		expect(list).toHaveLength(2);
		expect(list.items).toEqual(expect.arrayContaining([1, 3]));
		expect(list.removedItems).toHaveLength(1);
		expect(list.removedItems).toEqual(expect.arrayContaining([2]));

		list.add(2);

		expect(list).toHaveLength(3);
		expect(list.items).toEqual(expect.arrayContaining([1, 2, 3]));
		expect(list.removedItems).toHaveLength(0);
		expect(list.newItems).toHaveLength(0);
	});

	it("should be able to remove an item even if it was added before", () => {
		const list = new NumberList([1, 2, 3]);

		list.add(4);

		expect(list).toHaveLength(4);
		expect(list.items).toEqual(expect.arrayContaining([1, 2, 3, 4]));
		expect(list.newItems).toHaveLength(1);
		expect(list.newItems).toEqual(expect.arrayContaining([4]));

		list.remove(4);

		expect(list).toHaveLength(3);
		expect(list.items).toEqual(expect.arrayContaining([1, 2, 3]));
		expect(list.removedItems).toHaveLength(0);
		expect(list.newItems).toHaveLength(0);
	});

	it("should be able to update the list", () => {
		const list = new NumberList([1, 2, 3, 4]);

		list.update([1, 3, 5, 7]);

		expect(list.removedItems).toHaveLength(2);
		expect(list.removedItems).toEqual(expect.arrayContaining([2, 4]));
		expect(list.newItems).toHaveLength(2);
		expect(list.newItems).toEqual(expect.arrayContaining([5, 7]));
		expect(list).toHaveLength(4);
		expect(list.items).toEqual(expect.arrayContaining([1, 3, 5, 7]));
	});

	it("should be able to update a registered item", () => {
		const list = new NumberList([1, 2, 3, 4]);

		list[2] = 5;

		expect(list.removedItems).toHaveLength(1);
		expect(list.removedItems).toEqual(expect.arrayContaining([3]));
		expect(list.newItems).toHaveLength(1);
		expect(list.newItems).toEqual(expect.arrayContaining([5]));
		expect(list).toHaveLength(4);
		expect(list.items).toEqual([1, 2, 5, 4]);
	});

	it("should be able to reset the list", () => {
		const list = new NumberList([1, 2, 3, 4]);

		list.update([2, 3, 4, 6]);
		list.add(5);
		list.remove(1);

		list.reset();

		expect(list).toHaveLength(4);
		expect(list.items).toEqual(expect.arrayContaining([1, 2, 3, 4]));
		expect(list.newItems).toHaveLength(0);
		expect(list.removedItems).toHaveLength(0);
	});
});

describe("WatchedList Features", () => {
	it("should be able to get length of the list", () => {
		const list = new NumberList([1, 2, 3, 4]);

		expect(list.length).toBe(4);
	});

	it("should be able to map the list", () => {
		class MultipliedList extends WacthedList<number> {
			compareItems(a: number, b: number): boolean {
				return a === b;
			}
		}

		const list = new NumberList([1, 2, 3, 4]);

		const mapped = list.map(
			(item) => item * 2,
			(items) => new MultipliedList(items),
		);

		expect(mapped).toHaveLength(4);
		expect(mapped.items).toEqual(expect.arrayContaining([2, 4, 6, 8]));
	});

	it("should be able to map the list to an array", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const mapped = list.mapToArray((item) => item * 2);

		expect(mapped).toHaveLength(4);
		expect(mapped).toEqual(expect.arrayContaining([2, 4, 6, 8]));
	});

	it("should be able to filter the list with self update", () => {
		const list = new NumberList([1, 2, 3, 4]);

		list.add(5);

		list.filter((item) => item % 2 === 0);

		expect(list).toHaveLength(2);
		expect(list.items).toEqual(expect.arrayContaining([2, 4]));
		expect(list.newItems).toHaveLength(0);
		expect(list.removedItems).toHaveLength(2);
	});

	it("should be able to filter the list with new list", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const filtered = list.filter((item) => item % 2 === 0, false);

		expect(filtered).toHaveLength(2);
		expect(filtered.items).toEqual(expect.arrayContaining([2, 4]));
		expect(filtered.newItems).toHaveLength(0);
		expect(filtered.removedItems).toHaveLength(0);
	});

	it("should be able to find an item in the list from a value", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const found = list.find(3);

		expect(found).toBe(3);
	});

	it("should be able to find an item in the list from a function", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const found = list.find((item) => item % 2 === 0);

		expect(found).toBe(2);
	});

	it("should be able to find the last item in the list from a value", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const found = list.lastFind(3);

		expect(found).toBe(3);
	});

	it("should be able to find the last item in the list from a function", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const found = list.lastFind((item) => item % 2 === 0);

		expect(found).toBe(4);
	});

	it("should be able to check if some items in the list pass the test", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const some = list.some((item) => item % 2 === 0);

		expect(some).toBe(true);
	});

	it("should be able to check if every item in the list pass the test", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const every = list.every((item) => item % 2 === 0);

		expect(every).toBe(false);
	});

	it("should be able to iterate over the list", () => {
		let sum = 0;
		const spy = vi.fn((item: number) => {
			sum += item;
		});
		const list = new NumberList([1, 2, 3, 4]);

		// biome-ignore lint:
		list.forEach((item) => {
			spy(item);
		});

		expect(sum).toBe(10);
		expect(spy).toHaveBeenCalledTimes(4);
	});

	it("should be able to check if the list includes an item", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const includes = list.includes(3);

		expect(includes).toBe(true);
	});

	it("should be able to check if the list includes an item deeply", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const includes = list.deepIncludes(3);

		expect(includes).toBe(true);
	});

	it("should be able to get the index of an item", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const index = list.indexOf(3);

		expect(index).toBe(2);
	});

	it("should be able to get the index of an item that is not in the list", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const index = list.indexOf(5);

		expect(index).toBe(-1);
	});

	it("should be able to get the index of an item from a start index", () => {
		const list = new NumberList([1, 2, 3, 4, 3]);

		const index = list.indexOf(3, 2);

		expect(index).toBe(2);
	});

	it("should be able to get the index of an item from a start index that is not in the list", () => {
		const list = new NumberList([1, 2, 3, 4, 3]);

		const index = list.indexOf(5, 2);

		expect(index).toBe(-1);
	});

	it("should be able to get the last index of an item", () => {
		const list = new NumberList([1, 2, 3, 4, 3]);

		const index = list.lastIndexOf(3);

		expect(index).toBe(4);
	});

	it("should be able to get the last index of an item that is not in the list", () => {
		const list = new NumberList([1, 2, 3, 4, 3]);

		const index = list.lastIndexOf(5);

		expect(index).toBe(-1);
	});

	it("should be able to get the last index of an item from a start index", () => {
		const list = new NumberList([1, 2, 3, 4, 3]);

		const index = list.lastIndexOf(3, 3);

		expect(index).toBe(2);
	});

	it("should be able to get the last index of an item from a start index that is not in the list", () => {
		const list = new NumberList([1, 2, 3, 4, 3]);

		const index = list.lastIndexOf(5, 3);

		expect(index).toBe(-1);
	});

	it("should be able to join the list", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const joined = list.join("-");

		expect(joined).toBe("1-2-3-4");
	});

	it("should be able to slice the list", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const sliced = list.slice(1, 3);

		expect(sliced).toHaveLength(2);
		expect(sliced).toEqual(expect.arrayContaining([2, 3]));
	});

	it("should be able to slice the list with a start index", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const sliced = list.slice(2);

		expect(sliced).toHaveLength(2);
		expect(sliced).toEqual(expect.arrayContaining([3, 4]));
	});

	it("should be able to slice the list with a negative start index", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const sliced = list.slice(-2);

		expect(sliced).toHaveLength(2);
		expect(sliced).toEqual(expect.arrayContaining([3, 4]));
	});

	it("should be able to slice the list with a negative end index", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const sliced = list.slice(1, -1);

		expect(sliced).toHaveLength(2);
		expect(sliced).toEqual(expect.arrayContaining([2, 3]));
	});

	it("should be able to turn the list into a string", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const stringified = list.toString();

		expect(stringified).toBe("1,2,3,4");
	});

	it("should be able to turn the list into a locale string", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const stringified = list.toLocaleString();

		expect(stringified).toBe("1,2,3,4");
	});

	it("should be able to concat the list", () => {
		const list = new NumberList([1, 2, 3, 4]);

		list.concat([5, 6]);

		expect(list).toHaveLength(6);
		expect(list.items).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6]));
	});

	it("should be able to concat the list and return", () => {
		const list = new NumberList([1, 2, 3, 4]);

		const concated = list.concat([5, 6], false);

		expect(concated).toHaveLength(6);
		expect(concated.items).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6]));
	});
});
