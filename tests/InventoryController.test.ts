import {
	expect, describe, test, jest, afterEach,
} from "@jest/globals";
import InventoryController, { BlacklistEntry, SupplyEntry } from "../src/InventoryController";
import { TurtleUtils } from "../src/TurtleUtils";
import * as OsUtils from "../src/OsUtils";
import { mockInventoryPeripheral } from "./lib/Inventory";
import * as InventoryUtils from "../src/InventoryUtil";

describe("InventoryController", () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("findEnderChest", () => {
		test("Inventory has chest", () => {
			const invController = new InventoryController([], []);

			jest.spyOn(global.turtle, "getItemDetail").mockImplementation((slot) => {
				if (slot === 3) {
					return {
						name: "enderchests:ender_chest",
						count: 1,
						maxCount: 64,
					} as ItemDetail;
				}

				return null;
			});

			expect(invController.findEnderChest()).toBe(3);
		});

		test("Inventory does not have chest", () => {
			const invController = new InventoryController([], []);

			jest.spyOn(global.turtle, "getItemDetail").mockReturnValue(null);

			expect(invController.findEnderChest()).toBe(null);
		});
	});

	describe("placeChest", () => {
		test("No chest in inventory", () => {
			const invController = new InventoryController([], []);

			jest.spyOn(global.turtle, "getItemDetail").mockReturnValue(null);

			expect(invController.placeChest()).toBe(false);
		});

		test("Placed without obstructions", () => {
			const invController = new InventoryController([], []);
			const chestSlot = 2;

			jest.spyOn(invController, "findEnderChest").mockReturnValue(chestSlot);
			const selectFunc = jest.spyOn(global.turtle, "select");
			const turnFunc = jest.spyOn(global.turtle, "turnLeft");
			const digFunc = jest.spyOn(global.turtle, "dig");
			const placeFunc = jest.spyOn(global.turtle, "place");

			expect(invController.placeChest(true)).toBe(true);
			expect(selectFunc).toBeCalledWith(chestSlot);
			expect(turnFunc).toBeCalledTimes(2);
			expect(digFunc).toBeCalledTimes(0);
			expect(placeFunc).toBeCalledTimes(1);
		});

		test("Placed with obstruction", () => {
			const invController = new InventoryController([], []);
			const chestSlot = 2;

			jest.spyOn(invController, "findEnderChest").mockReturnValue(chestSlot);
			const selectFunc = jest.spyOn(global.turtle, "select");
			const turnFunc = jest.spyOn(global.turtle, "turnLeft");
			const digFunc = jest.spyOn(global.turtle, "dig");
			const placeFunc = jest.spyOn(global.turtle, "place").mockReturnValueOnce(false);

			expect(invController.placeChest(true)).toBe(true);
			expect(selectFunc).toBeCalledWith(chestSlot);
			expect(turnFunc).toBeCalledTimes(2);
			expect(digFunc).toBeCalledTimes(1);
			expect(placeFunc).toBeCalledTimes(2);
		});
	});

	describe("sortInventory", () => {
		test("Empty inventory", () => {
			const invController = new InventoryController([], []);

			jest.spyOn(global.turtle, "getItemDetail").mockReturnValue(null);
			const transferFunc = jest.spyOn(global.turtle, "transferTo");

			invController.sortInventory();
			expect(transferFunc).toBeCalledTimes(0);
		});

		test("Full inventory, all items presorted", () => {
			const invController = new InventoryController([], []);

			jest.spyOn(global.turtle, "getItemDetail").mockReturnValue({
				name: "minecraft:cobblestone",
				count: 64,
				maxCount: 64,
			} as ItemDetail);
			jest.spyOn(global.turtle, "getItemSpace").mockReturnValue(0);
			const transferFunc = jest.spyOn(global.turtle, "transferTo");

			invController.sortInventory();
			expect(transferFunc).toBeCalledTimes(0);
		});

		test("Unsorted items", () => {
			const invController = new InventoryController([], []);

			const unsortedItem: ItemDetail = {
				name: "minecraft:cobblestone",
				count: 20,
				maxCount: 64,
				displayName: "Cobblestone",
				tags: [],
			};

			jest
				.spyOn(global.turtle, "getItemDetail")
				.mockReturnValueOnce(unsortedItem)
				.mockReturnValueOnce(unsortedItem)
				.mockReturnValue(null);
			jest
				.spyOn(global.turtle, "getItemSpace")
				.mockReturnValueOnce(44)
				.mockReturnValueOnce(44);
			const transferFunc = jest.spyOn(global.turtle, "transferTo");

			invController.sortInventory();
			expect(transferFunc).toBeCalledTimes(1);
		});
	});

	describe("isInventoryFull", () => {
		test("Empty inventory", () => {
			const invController = new InventoryController([], []);

			jest.spyOn(global.turtle, "getItemDetail").mockReturnValue(null);

			expect(invController.isInventoryFull()).toBe(false);
		});

		test("Non-empty inventory", () => {
			const invController = new InventoryController([], []);
			const testItem: ItemDetail = {
				name: "minecraft:cobblestone",
				count: 20,
				maxCount: 64,
				displayName: "Cobblestone",
				tags: [],
			};

			jest
				.spyOn(global.turtle, "getItemDetail")
				.mockReturnValueOnce(testItem)
				.mockReturnValueOnce(testItem)
				.mockReturnValueOnce(testItem)
				.mockReturnValue(null);

			expect(invController.isInventoryFull()).toBe(false);
		});

		test("Full inventory", () => {
			const invController = new InventoryController([], []);
			const testItem: ItemDetail = {
				name: "minecraft:cobblestone",
				count: 20,
				maxCount: 64,
				displayName: "Cobblestone",
				tags: [],
			};

			jest.spyOn(global.turtle, "getItemDetail").mockReturnValue(testItem);

			expect(invController.isInventoryFull()).toBe(true);
		});
	});

	describe("clearInventory", () => {
		test("No blacklisted item overflow", () => {
			const blacklist: BlacklistEntry[] = [
				{ name: "minecraft:coal", maxCount: 64 },
			];

			const testItemSlot = 6;
			const testItem: ItemDetail = {
				name: "minecraft:cobblestone",
				count: 20,
				maxCount: 64,
				displayName: "Cobblestone",
				tags: [],
			};

			const blacklistedItemSlot = 2;
			const blacklistedItem: ItemDetail = {
				name: "minecraft:coal",
				count: 20,
				maxCount: 64,
				displayName: "Coal",
				tags: [],
			};

			const invController = new InventoryController(blacklist, []);

			const dropFunc = jest.spyOn(TurtleUtils, "dropDirection");
			const selectFunc = jest.spyOn(global.turtle, "select");
			jest.spyOn(global.turtle, "getItemDetail").mockImplementation((slot) => {
				if (slot === blacklistedItemSlot) return blacklistedItem;
				if (slot === testItemSlot) return testItem;

				return null;
			});

			invController.clearInventory();

			expect(selectFunc).not.toBeCalledWith(blacklistedItemSlot);
			expect(selectFunc).toBeCalledWith(testItemSlot);
			expect(dropFunc).toBeCalledTimes(1);
		});

		test("Blacklisted item overflow", () => {
			const blacklist: BlacklistEntry[] = [
				{ name: "minecraft:coal", maxCount: 15 },
			];

			const testItemSlot = 6;
			const testItem: ItemDetail = {
				name: "minecraft:cobblestone",
				count: 20,
				maxCount: 64,
				displayName: "Cobblestone",
				tags: [],
			};

			const blacklistedItemSlot = 2;
			const blacklistedItem: ItemDetail = {
				name: "minecraft:coal",
				count: 50,
				maxCount: 64,
				displayName: "Coal",
				tags: [],
			};

			const invController = new InventoryController(blacklist, []);

			const dropFunc = jest.spyOn(TurtleUtils, "dropDirection");
			const selectFunc = jest.spyOn(global.turtle, "select");
			jest.spyOn(global.turtle, "getItemDetail").mockImplementation((slot) => {
				if (slot === blacklistedItemSlot) return blacklistedItem;
				if (slot === testItemSlot) return testItem;

				return null;
			});

			invController.clearInventory();

			expect(selectFunc).toBeCalledWith(blacklistedItemSlot);
			expect(selectFunc).toBeCalledWith(testItemSlot);
			expect(dropFunc).toBeCalledTimes(2);
			expect(dropFunc).toBeCalledWith("front", blacklistedItem.count - blacklist[0].maxCount);
			expect(dropFunc).toBeCalledWith("front", testItem.count);
		});
	});

	describe("resupplyInventory", () => {
		test("No chest placed", () => {
			const invController = new InventoryController([], []);

			jest.spyOn(peripheral, "wrap").mockReturnValue(null);
			jest
				.spyOn(OsUtils, "getTimeSeconds")
				.mockImplementation(() => (new Date()).getTime() / 1000);

			expect(invController.resupplyInventory()).toBe(false);
		});

		test("Quota met", () => {
			mockInventoryPeripheral();
			const whitelist: SupplyEntry[] = [
				{ name: "minecraft:coal", count: 10 },
				{ name: "minecraft:lava_bucket", count: 1 },
			];
			const invController = new InventoryController([], whitelist);
			const pullFunc = jest.spyOn(InventoryUtils, "pullItemFromInventorySlot");

			expect(invController.resupplyInventory()).toBe(true);
			expect(pullFunc).toBeCalledTimes(2);
		});

		test("Quota met", () => {
			mockInventoryPeripheral();
			const whitelist: SupplyEntry[] = [
				{ name: "minecraft:coal", count: 50 },
				{ name: "minecraft:lava_bucket", count: 1 },
			];
			const invController = new InventoryController([], whitelist);
			const pullFunc = jest.spyOn(InventoryUtils, "pullItemFromInventorySlot");

			expect(invController.resupplyInventory()).toBe(false);
			expect(pullFunc).toBeCalledTimes(2);
		});
	});

	describe("refreshInventory", () => {
		test("Failed to place chest", () => {
			const invController = new InventoryController([], []);

			jest.spyOn(invController, "placeChest").mockReturnValue(false);

			expect(invController.refreshInventory()).toBe(false);
		});

		test("Quota not met", () => {
			const invController = new InventoryController([], []);

			jest.spyOn(invController, "placeChest").mockReturnValue(true);
			jest.spyOn(invController, "clearInventory").mockReturnValue();
			jest.spyOn(invController, "resupplyInventory").mockReturnValue(false);

			// TODO: Reimplement with proper logger
			// const printFunc = jest.spyOn(global, "print");
			const digFunc = jest.spyOn(global.turtle, "dig");
			const turnFunc = jest.spyOn(global.turtle, "turnLeft");

			expect(invController.refreshInventory()).toBe(true);
			// expect(printFunc).toBeCalledWith("WARNING: Resupply quota not met");
			expect(digFunc).toBeCalledTimes(1);
			expect(turnFunc).toBeCalledTimes(2);
		});

		test("Clear and resupply successful", () => {
			const invController = new InventoryController([], []);

			jest.spyOn(invController, "placeChest").mockReturnValue(true);
			jest.spyOn(invController, "clearInventory").mockReturnValue();
			jest.spyOn(invController, "resupplyInventory").mockReturnValue(true);
			// const printFunc = jest.spyOn(global, "print");
			const digFunc = jest.spyOn(global.turtle, "dig");
			const turnFunc = jest.spyOn(global.turtle, "turnLeft");

			expect(invController.refreshInventory()).toBe(true);
			// expect(printFunc).not.toBeCalledWith("WARNING: Resupply quota not met");
			expect(digFunc).toBeCalledTimes(1);
			expect(turnFunc).toBeCalledTimes(2);
		});
	});
});
