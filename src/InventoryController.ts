import { findFirstItem, getItem } from "./InventoryUtil";

const ENDER_CHEST_ID = "enderchests:ender_chest";

export interface BlacklistEntry {
	name: string,
	maxCount?: number,
}

export default class InventoryController {
	blacklist: BlacklistEntry[];

	constructor(clearBlacklist: BlacklistEntry[]) {
		this.blacklist = [...clearBlacklist, { name: ENDER_CHEST_ID }];

		if (!this.findEnderChest()) {
			print("WARNING: No ender chest in inventory");
		}
	}

	private findEnderChest() {
		return findFirstItem((name) => name === ENDER_CHEST_ID)?.slot ?? null;
	}

	private placeChest(force = true): boolean {
		const chestSlot = this.findEnderChest();

		if (chestSlot === null) return false;

		turtle.select(chestSlot);
		turtle.turnLeft();
		turtle.turnLeft();

		while (!turtle.place() && force) {
			turtle.dig();
		}

		return true;
	}

	sortInventory() {
		for (let slot = 1; slot <= 16; slot++) {
			const item = getItem(slot);

			if (item) {
				for (let otherSlot = slot + 1; otherSlot <= 16; otherSlot++) {
					const otherItem = getItem(otherSlot);

					if (otherItem?.name === item.name && otherItem?.nbt === item?.nbt) {
						turtle.select(otherSlot);
						turtle.transferTo(slot);
					}
				}
			}
		}
	}

	clearInventory(): boolean {
		if (!this.placeChest()) return false;

		for (let slot = 1; slot <= 16; slot++) {
			const item = getItem(slot);

			if (item) {
				const blacklistEntry = this.blacklist.find(e => e.name === item.name);
				let valid = blacklistEntry === undefined;
				let itemOverflow: number | undefined = undefined;

				if (blacklistEntry?.maxCount !== undefined) {
					const overflowNum = Number(item.count) - blacklistEntry.maxCount;

					if (overflowNum > 0) itemOverflow = overflowNum;
				}

				if (valid || itemOverflow !== undefined) {
					turtle.select(slot);
					turtle.drop(itemOverflow as any);
				}
			}
		}

		// Turn back around after removing the chest
		turtle.dig();
		turtle.turnLeft();
		turtle.turnLeft();
	}

	isInventoryFull(): boolean {
		let full = true;

		for (let slot = 1; slot < 16; slot++) {
			const item = getItem(slot);

			if (!item) {
				full = false;
				break;
			}
		}

		return full;
	}
}
