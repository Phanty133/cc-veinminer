import { findFirstItem } from "./InventoryUtil";
import type { BlockId } from "./minecraft";

export default class FuelController {
	whitelist: BlockId[];
	minLevel: number;

	constructor(fuelWhitelist: BlockId[], minFuelLevel) {
		this.whitelist = fuelWhitelist;
		this.minLevel = minFuelLevel;
	}

	ensureFuel() {
		const curFuel = turtle.getFuelLevel();

		if (curFuel >= this.minLevel) return;

		const fuel = findFirstItem((name) => this.whitelist.includes(name));

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