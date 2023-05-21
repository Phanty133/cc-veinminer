import type { BlockId } from "./minecraft";

export default class FuelController {
	whitelist: BlockId[];
	minLevel: number;

	constructor(fuelWhitelist: BlockId[], minFuelLevel) {
		this.whitelist = fuelWhitelist;
		this.minLevel = minFuelLevel;
	}

	private findFuelItem(): { slot: number, item: string } | null {
		for (let slot = 1; slot <= 16; slot++) {
			const itemAttempt = turtle.getItemDetail(slot);

			if (itemAttempt) {
				const item = itemAttempt as ItemDetail;

				if (this.whitelist.includes(item.name)) {
					return { slot: Number(slot), item: item.name };
				}
			}
		}
		
		return null;
	}

	ensureFuel() {
		const curFuel = turtle.getFuelLevel();

		if (curFuel >= this.minLevel) return;

		const fuel = this.findFuelItem();

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