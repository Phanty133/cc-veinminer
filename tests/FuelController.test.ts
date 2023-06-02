import {
	expect, describe, test, jest, afterEach,
} from "@jest/globals";
import FuelController from "../src/FuelController";
import InventoryController from "../src/InventoryController";
import * as InventoryUtil from "../src/InventoryUtil";

describe("FuelController", () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("Refuel from inventory", () => {
		test("Fuel level met", () => {
			const inv = new InventoryController([], []);
			const fuel = new FuelController(["minecraft:coal"], 100, inv);

			jest.spyOn(global.turtle, "getFuelLevel").mockReturnValueOnce(200);
			const refuelFunc = jest.spyOn(global.turtle, "refuel");

			fuel.ensureFuel();
			expect(refuelFunc).toBeCalledTimes(0);
		});

		test("Fuel level not met", () => {
			const inv = new InventoryController([], []);
			const fuel = new FuelController(["minecraft:coal"], 100, inv);
			const targetFuel: { slot: number, item: ItemDetail } = {
				slot: 3,
				item: {
					name: "minecraft:coal",
					count: 1,
					displayName: "Coal",
					maxCount: 64,
					tags: [],
				},
			};

			jest.spyOn(global.turtle, "getFuelLevel").mockReturnValueOnce(50);
			const findFunc = jest.spyOn(InventoryUtil, "findFirstItem").mockReturnValueOnce(targetFuel);
			const selectFunc = jest.spyOn(global.turtle, "select");
			const refuelFunc = jest.spyOn(global.turtle, "refuel").mockReturnValueOnce(true);

			fuel.ensureFuel();

			expect(findFunc).toBeCalledTimes(1);
			expect(selectFunc).toBeCalledTimes(1);
			expect(selectFunc).toBeCalledWith(targetFuel.slot);
			expect(refuelFunc).toBeCalledTimes(1);
		});
	});

	describe("Refuel from resupply", () => {

	});
});
