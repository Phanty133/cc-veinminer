import { findFirstItem, forSlot, getItem } from "./InventoryUtil";
import { BlockId } from "./minecraft";

export interface BlacklistEntry {
	/** Item ID of item to blacklist */
	name: string,

	/** Maximum number of items to keep. Overflow will get cleared. */
	maxCount?: number,
}

/** Manages the turtle inventory */
export default class InventoryController {
	blacklist: BlacklistEntry[];

	enderChestId: BlockId;

	/**
	 * Initializes InventoryController
	 * @param clearBlacklist Array of blacklisted items
	 * @param enderChestId ID of the ender chest to use. Defaults to ender chest from Ender Chests
	 */
	constructor(
		clearBlacklist: BlacklistEntry[],
		enderChestId: BlockId = "enderchests:ender_chest",
	) {
		this.enderChestId = enderChestId;
		this.blacklist = [...clearBlacklist, { name: enderChestId }];

		if (!this.findEnderChest()) {
			print("WARNING: No ender chest in inventory");
		}
	}

	/**
	 * Finds the ender chest in the inventory
	 * @returns Slot with ender chest. `null` if no ender chest found.
	 */
	private findEnderChest() {
		return findFirstItem((item) => item.name === this.enderChestId)?.slot ?? null;
	}

	/**
	 * Place the ender chest behind the turtle
	 * @param force If true, the turtle will attempt to dig out blocks if the placement fails
	 * @returns True if chest placed
	 */
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

	/**
	 * Combines non-full item stacks.
	 */
	// eslint-disable-next-line class-methods-use-this
	sortInventory() {
		forSlot((slot, item) => {
			if (item) {
				forSlot((otherSlot, otherItem) => {
					if (otherItem?.name === item.name && otherItem?.nbt === item?.nbt) {
						turtle.select(otherSlot);
						turtle.transferTo(slot);
					}
				});
			}
		});
	}

	/**
	 * Clears the inventory into the ender chest.
	 * @returns True if inventory cleared.
	 */
	clearInventory(): boolean {
		if (!this.placeChest()) return false;

		forSlot((slot, item) => {
			if (item) {
				const blacklistEntry = this.blacklist.find((e) => e.name === item.name);
				let itemOverflow: number | undefined;

				if (blacklistEntry?.maxCount !== undefined) {
					const overflowNum = Number(item.count) - blacklistEntry.maxCount;

					if (overflowNum > 0) itemOverflow = overflowNum;
				}

				if (blacklistEntry === undefined || itemOverflow !== undefined) {
					turtle.select(slot);
					turtle.drop(itemOverflow as any);
				}
			}
		});

		// Turn back around after removing the chest
		turtle.dig();
		turtle.turnLeft();
		turtle.turnLeft();

		return true;
	}

	// eslint-disable-next-line class-methods-use-this
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
