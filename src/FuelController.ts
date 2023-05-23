import { findFirstItem } from "./InventoryUtil";
import type { BlockId } from "./minecraft";

/** Ensures a minimum fuel level */
export default class FuelController {
	whitelist: BlockId[];

	minLevel: number;

	/**
	 * Initializes FuelController
	 * @param fuelWhitelist Array of item IDs to use as fuel
	 * @param minFuelLevel If the fuel level falls under this value, the turtle will refuel
	 */
	constructor(fuelWhitelist: BlockId[], minFuelLevel: number) {
		this.whitelist = fuelWhitelist;
		this.minLevel = minFuelLevel;
	}

	/**
	 * Ensure that the turtle fuel level meets `minFuelLevel`.
	 */
	ensureFuel() {
		const curFuel = turtle.getFuelLevel();

		if (curFuel >= this.minLevel) return;

		const fuel = findFirstItem((item) => this.whitelist.includes(item.name));

		if (fuel === null) {
			print("ERROR: No valid fuel found!");
			return;
		}

		turtle.select(fuel.slot);

		if (turtle.refuel(1)) {
			print(`INFO: Refueled with ${fuel.item}`);
		} else {
			print("ERROR: Failed to refuel!");
		}
	}
}
