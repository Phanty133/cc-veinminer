import InventoryController from "./InventoryController";
import { findFirstItem } from "./InventoryUtil";
import type { BlockId } from "./minecraft";

/** Ensures a minimum fuel level */
export default class FuelController {
	private invController: InventoryController;

	whitelist: BlockId[];

	minLevel: number;

	/**
	 * Initializes FuelController
	 * @param fuelWhitelist Array of item IDs to use as fuel
	 * @param minFuelLevel If the fuel level falls under this value, the turtle will refuel
	 * @param invController Inventory controller
	 */
	constructor(fuelWhitelist: BlockId[], minFuelLevel: number, invController: InventoryController) {
		this.whitelist = fuelWhitelist;
		this.minLevel = minFuelLevel;
		this.invController = invController;
	}

	/**
	 * Ensure that the turtle fuel level meets `minFuelLevel`.
	 */
	ensureFuel() {
		const curFuel = turtle.getFuelLevel();

		if (curFuel >= this.minLevel) return;

		let fuel = findFirstItem((item) => this.whitelist.includes(item.name));

		// A tad jank resupply handling
		if (fuel === null) {
			this.invController.refreshInventory();
			fuel = findFirstItem((item) => this.whitelist.includes(item.name));

			if (fuel === null) {
				print("ERROR: No valid fuel found in inventory or resupplied");
				return;
			}
		}

		turtle.select(fuel.slot);

		if (turtle.refuel(1)) {
			print(`INFO: Refueled with ${fuel.item.name}`);
		} else {
			print("ERROR: Failed to refuel!");
		}
	}
}
