import {
	expect, describe, test, jest, afterEach,
} from "@jest/globals";
import * as InventoryUtil from "../src/InventoryUtil";
import {
	mockInventoryPeripheral, mockTurtleDropDirection, mockTurtleInventory, mockTurtleSuckDirection,
} from "./lib/Inventory";

describe("InventoryUtil", () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("getItem", () => {
		test("Has item", () => {
			const [itemDetailFunc] = mockTurtleInventory();

			const slot = 2;
			const value = InventoryUtil.getItem(slot);

			expect(value?.name).toBe("minecraft:coal");
			expect(itemDetailFunc).toBeCalledTimes(1);
			expect(itemDetailFunc).toBeCalledWith(slot);
		});

		test("No item", () => {
			const [itemDetailFunc] = mockTurtleInventory();

			const slot = 8;
			const value = InventoryUtil.getItem(slot);

			expect(value).toBe(null);
			expect(itemDetailFunc).toBeCalledTimes(1);
			expect(itemDetailFunc).toBeCalledWith(slot);
		});
	});

	describe("forSlot", () => {
		test("Full loop", () => {
			const mockCb = jest.fn(() => false);

			InventoryUtil.forSlot(mockCb);

			expect(mockCb).toBeCalledTimes(16);
		});

		test("Break loop", () => {
			const mockCb = jest.fn((slot: number) => slot % 8 === 0);

			InventoryUtil.forSlot(mockCb);

			expect(mockCb).toBeCalledTimes(8);
		});

		test("Loop offset", () => {
			const mockCb = jest.fn(() => false);

			InventoryUtil.forSlot(mockCb, 5, 8);

			expect(mockCb).toBeCalledTimes(4);
		});
	});

	describe("findFirstItem", () => {
		test("Item found", () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const [detailFunc, inv] = mockTurtleInventory();

			const predicate = jest.fn((item: ItemDetail) => item.name === "minecraft:cobblestone");
			const result = InventoryUtil.findFirstItem(predicate);

			expect(result).toEqual({ slot: 4, item: inv[4] });
		});

		test("No item found", () => {
			mockTurtleInventory();

			const predicate = jest.fn((item: ItemDetail) => item.name === "fakeitem");
			const result = InventoryUtil.findFirstItem(predicate);

			expect(result).toBe(null);
		});
	});

	describe("findFirstEmpty", () => {
		test("Has empty", () => {
			jest.spyOn(global.turtle, "getItemCount")
				.mockImplementation((slot) => (slot % 5 === 0 ? 0 : 1));

			const result = InventoryUtil.findFirstEmpty();

			expect(result).toBe(5);
		});

		test("Inventory full", () => {
			jest.spyOn(global.turtle, "getItemCount")
				.mockImplementation(() => 1);

			const result = InventoryUtil.findFirstEmpty();

			expect(result).toBe(null);
		});
	});

	describe("countItemInInventory", () => {
		test("Item in single slot", () => {
			mockTurtleInventory();

			const result = InventoryUtil.countItemInInventory("minecraft:coal");
			expect(result).toBe(20);
		});

		test("Item split between slots", () => {
			mockTurtleInventory();

			const result = InventoryUtil.countItemInInventory("minecraft:cobblestone");
			expect(result).toBe(52);
		});

		test("Item not in inventory", () => {
			mockTurtleInventory();

			const result = InventoryUtil.countItemInInventory("minecraft:diamond");
			expect(result).toBe(0);
		});
	});

	describe("pullItemFromInventorySlot", () => {
		test("No inventory peripheral", () => {
			const result = InventoryUtil.pullItemFromInventorySlot("front", 1, 10);

			expect(result).toBe(0);
		});

		test("First slot", () => {
			const { peripheral } = mockInventoryPeripheral();

			const suckFunc = mockTurtleSuckDirection(peripheral);
			const result = InventoryUtil.pullItemFromInventorySlot("front", 1, 10);

			expect(result).toBe(10);
			expect(suckFunc).toBeCalledTimes(1);
			expect(suckFunc).toBeCalledWith("front", result);
		});

		describe("Arbitrary slot", () => {
			test("Inventory full, turtle first slot free", () => {
				const targetSlot = 10;
				const targetAmount = 10;
				const { peripheral } = mockInventoryPeripheral((inventory, size) => {
					const inv = { ...inventory };

					for (let slot = 1; slot <= size; slot++) {
						inv[slot] = {
							name: "minecraft:cobblestone",
							count: 64,
							displayName: "Cobblestone",
							maxCount: 64,
							tags: [],
						};
					}

					inv[targetSlot] = {
						name: "minecraft:coal",
						count: 20,
						displayName: "Coal",
						maxCount: 64,
						tags: [],
					};

					return { inventory: inv, size };
				});

				const originalPeriphFirstSlot = peripheral.list()[1];
				const origTargetSlotCount = peripheral.list()[targetSlot].count;
				jest.spyOn(global.turtle, "getItemCount").mockReturnValue(0);
				mockTurtleSuckDirection(peripheral);
				mockTurtleDropDirection(peripheral, originalPeriphFirstSlot);
				const result = InventoryUtil.pullItemFromInventorySlot("front", targetSlot, targetAmount);

				expect(result).toBe(targetAmount);
				expect(peripheral.list()[1]).toEqual(originalPeriphFirstSlot);
				expect(peripheral.list()[targetSlot].count).toBe(origTargetSlotCount - targetAmount);
			});

			test("Inventory full, turtle first slot not free", () => {
				const targetSlot = 10;
				const targetAmount = 10;
				const { peripheral } = mockInventoryPeripheral((inventory, size) => {
					const inv = { ...inventory };

					for (let slot = 1; slot <= size; slot++) {
						inv[slot] = {
							name: "minecraft:cobblestone",
							count: 64,
							displayName: "Cobblestone",
							maxCount: 64,
							tags: [],
						};
					}

					inv[targetSlot] = {
						name: "minecraft:coal",
						count: 20,
						displayName: "Coal",
						maxCount: 64,
						tags: [],
					};

					return { inventory: inv, size };
				});

				const originalPeriphFirstSlot = peripheral.list()[1];
				const origTargetSlotCount = peripheral.list()[targetSlot].count;
				jest.spyOn(global.turtle, "getItemCount")
					.mockReturnValueOnce(1)
					.mockReturnValue(0);
				mockTurtleSuckDirection(peripheral);
				mockTurtleDropDirection(peripheral, originalPeriphFirstSlot);
				const result = InventoryUtil.pullItemFromInventorySlot("front", targetSlot, targetAmount);

				expect(result).toBe(targetAmount);
				expect(peripheral.list()[1]).toEqual(originalPeriphFirstSlot);
				expect(peripheral.list()[targetSlot].count).toBe(origTargetSlotCount - targetAmount);
			});

			test("Inventory not full, first slot empty", () => {
				const { peripheral } = mockInventoryPeripheral((inventory, size) => {
					const inv = { ...inventory };
					delete inv[1];

					return { inventory: inv, size };
				});

				jest.spyOn(global.turtle, "getItemCount").mockReturnValue(0);

				const originalCount = peripheral.list()[4].count;
				const pullCount = 10;

				const suckFunc = mockTurtleSuckDirection(peripheral);
				const result = InventoryUtil.pullItemFromInventorySlot("front", 4, pullCount);

				expect(result).toBe(10);
				expect(suckFunc).toBeCalledWith("front", result);
				expect(peripheral.list()[1]).toBeUndefined();
				expect(peripheral.list()[4]!.count).toBe(originalCount - pullCount);
			});

			test("Inventory not full, first slot not empty", () => {
				const { peripheral } = mockInventoryPeripheral();

				jest.spyOn(global.turtle, "getItemCount").mockReturnValue(0);

				const suckFunc = mockTurtleSuckDirection(peripheral);
				const result = InventoryUtil.pullItemFromInventorySlot("front", 4, 10);

				expect(result).toBe(10);
				expect(suckFunc).toBeCalledTimes(1);
				expect(suckFunc).toBeCalledWith("front", result);
			});

			test("Inventory not full, swapped item removed from inventory", () => {
				const { peripheral } = mockInventoryPeripheral();

				jest.spyOn(global.turtle, "getItemCount").mockReturnValue(0);

				// mockImplementationOnce should work because the swapped item is the
				// first item to be moved
				jest
					.spyOn(peripheral, "pushItems")
					.mockImplementationOnce((fromName: string, fromSlot: number, limit: number, toSlot: number) => {
						const val = peripheral.pushItems(fromName, fromSlot, limit, toSlot);

						// Remove the item after swap
						if (fromSlot === 1) {
							peripheral.removeItem(toSlot);
						}

						return val;
					});

				const suckFunc = mockTurtleSuckDirection(peripheral);
				const result = InventoryUtil.pullItemFromInventorySlot("front", 4, 10);

				expect(result).toBe(10);
				expect(suckFunc).toBeCalledTimes(1);
				expect(suckFunc).toBeCalledWith("front", result);
			});
		});
	});
});
