import {
	countItemInInventory,
	findFirstItem, forSlot, getItem, pullItemFromInventorySlot,
} from "./InventoryUtil";
import { getTimeSeconds } from "./OsUtils";
import { BlockId } from "./minecraft";

export interface BlacklistEntry {
	/** Item ID of item to blacklist */
	name: string,

	/** Maximum number of items to keep. Overflow will get cleared. */
	maxCount?: number,
}

export interface SupplyEntry {
	/** Item ID to pull from the ender chest */
	name: string,

	/** Number of items to pull from the ender chest */
	count: number,
}

/** Manages the turtle inventory */
export default class InventoryController {
	blacklist: BlacklistEntry[];

	supplyList: SupplyEntry[];

	enderChestId: BlockId;

	/**
	 * Initializes InventoryController
	 * @param clearBlacklist Array of blacklisted items
	 * @param supplyList Array of items to resupply from the ender chest.
	 * Automatically added to the blacklist with `maxCount=count`.
	 * @param enderChestId ID of the ender chest to use. Defaults to ender chest from Ender Chests
	 */
	constructor(
		clearBlacklist: BlacklistEntry[],
		supplyList: SupplyEntry[],
		enderChestId: BlockId = "enderchests:ender_chest",
	) {
		this.enderChestId = enderChestId;
		this.supplyList = supplyList;
		this.blacklist = [
			...supplyList.map(({ name, count }) => ({ name, maxCount: count })),
			...clearBlacklist,
			{ name: enderChestId },
		];

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
	 * Pulls items from the ender chest in front according to the supply list
	 * @param chestTimeout The time in seconds to wait until giving up on wrapping the chest as a peripheral.
	 * Required because there is a delay between placing the chest and being able to wrap it
	 * @returns True if the supply list quota was met
	 */
	resupplyInventory(chestTimeout = 1): boolean {
		let chest: InventoryPeripheral;
		const stopTime = getTimeSeconds() + chestTimeout;

		do {
			chest = peripheral.wrap("front") as InventoryPeripheral;
		} while (!chest && getTimeSeconds() < stopTime);

		if (!chest) {
			print("WARNING: Failed to wrap the chest as a peripheral");
			return false;
		}

		const items = chest.list();
		let quotaMet = true;

		for (const supplyItem of this.supplyList) {
			const existingItems = countItemInInventory(supplyItem.name);
			const supplyItemQuota = Math.max(supplyItem.count - existingItems, 0);
			let missingItems = supplyItemQuota;

			for (const invSlot of Object.keys(items)) {
				if (missingItems <= 0) break;

				const invItem = items[invSlot as unknown as keyof typeof items];

				if (invItem.name === supplyItem.name) {
					const actuallyPulled = pullItemFromInventorySlot(
						"front",
						Number(invSlot),
						Math.min(missingItems, invItem.count),
						chest,
					);

					missingItems -= actuallyPulled;
				}
			}

			if (missingItems > 0) quotaMet = false;
			if (supplyItemQuota > 0) {
				print(`INFO: Resupplied ${(supplyItemQuota - missingItems).toString()} ${supplyItem.name}`);
			}
		}

		return quotaMet;
	}

	/**
	 * Clears the inventory into the ender chest.
	 */
	clearInventory() {
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
	}

	/**
	 * Clears the inventory and resupplies
	 * @returns True if refresh successful
	 */
	refreshInventory(): boolean {
		if (!this.placeChest()) return false;

		this.clearInventory();
		const quotaMet = this.resupplyInventory();

		if (!quotaMet) {
			print("WARNING: Resupply quota not met");
		}

		this.sortInventory();

		// Turn back around after removing the chest
		turtle.dig();
		turtle.turnLeft();
		turtle.turnLeft();

		return true;
	}

	/**
	 * Checks whether all items slots are taken
	 * @returns True if inventory full
	 */
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
