import { TurtleUtils } from "./TurtleUtils";

/**
 * Gets item in slot
 * @param slot Slot to check
 * @returns Item data if item in slot, `null` if no item in slot
 */
export function getItem(slot: number): ItemDetail | null {
	const itemAttempt = turtle.getItemDetail(slot);

	return (itemAttempt as ItemDetail) ?? null;
}

/**
 * Executes a callback on every slot of the turtle's inventory
 * @param cb Callback to execute. If the callbackk returns `true`, the for loop breaks.
 * @param start Start slot (1-16)
 * @param end End slot (1-16)
 */
export function forSlot(
	cb: (slot: number, item: ItemDetail | null) => boolean | void,
	start = 1,
	end = 16,
) {
	for (let slot = start; slot <= end; slot++) {
		if (cb(slot, getItem(slot))) break;
	}
}

/**
 * Finds the first item that matches the predicate
 * @param predicate Predicate to use for item matching
 * @returns Item data and slot if found, `null` if item not found
 */
export function findFirstItem(
	predicate: (item: ItemDetail, slot: number) => boolean,
): { slot: number, item: ItemDetail } | null {
	for (let slot = 1; slot <= 16; slot++) {
		const item = getItem(slot);

		if (item) {
			if (predicate(item, slot)) return { slot: Number(slot), item };
		}
	}

	return null;
}

/**
 * Finds the first empty slot in the turtle
 * @returns 1-indexed empty slot. Null if no empty slot
 */
export function findFirstEmpty(): number | null {
	for (let slot = 1; slot <= 16; slot++) {
		if (turtle.getItemCount(slot) === 0) return slot;
	}

	return null;
}

/**
 * Counts the number of items with ID in inventory
 * @param name Item ID
 * @returns Number of items in the turtle's inventory
 */
export function countItemInInventory(name: string): number {
	let count = 0;

	forSlot((slot, item) => {
		if (item?.name === name) {
			count += Number(item.count);
		}
	});

	return count;
}

/**
 * Pulls from a specific slot from a peripheral's inventory.
 * If the target inventory is full, the turtle must have at least 1 free slot.
 * @param periphDir Peripheral direction
 * @param slot Slot to pull from
 * @param maxCount Maximum number of items to pull
 * @param invPeripheral Optional pre-wrapped peripheral in the `periphDir` direction
 * @returns Number of items pulled.
 */
export function pullItemFromInventorySlot(
	periphDir: "front" | "up" | "down",
	slot: number,
	maxCount: number,
	invPeripheral?: InventoryPeripheral,
): number {
	const chest = (invPeripheral ?? peripheral.wrap(periphDir)) as InventoryPeripheral;
	const invSize = chest.size();
	let chestFull = false;
	let invEmptySlot: number;

	if (!chest) return 0;
	if (slot !== 1) {
		// Find first empty slot in the chest

		for (invEmptySlot = 1; invEmptySlot <= invSize; invEmptySlot++) {
			if (!chest.getItemDetail(invEmptySlot)) break;
			if (invEmptySlot === invSize) chestFull = true;
		}

		const existingItemCount = Number(chest.getItemDetail(1)?.count) ?? 0;

		// If the chest is full, suck the first item into the turtle
		if (chestFull) {
			const turtleEmptySlot = findFirstEmpty();
			turtle.select(1);

			// Free the first slot of the turtle to have a predictable sucked item slot
			if (turtleEmptySlot !== 1) {
				turtle.transferTo(turtleEmptySlot, turtle.getItemCount(1));
			}

			turtle.suck(existingItemCount);
		}

		// If the 1st slot is not empty, move it to the first empty slot
		// The item will be moved back
		if (!chestFull && invEmptySlot !== 1) {
			chest.pushItems(periphDir, 1, existingItemCount, invEmptySlot);
		}

		// Move the target slot's item to the 1st slot
		chest.pushItems(periphDir, slot, maxCount, 1);
	}

	const pulledItems = Math.min(Number(chest.getItemDetail(1)?.count), maxCount);

	TurtleUtils.suckDirection(periphDir, maxCount);

	// Return any item the turtle must have had to suck in temporarily
	if (chestFull) {
		turtle.select(1);
		TurtleUtils.dropDirection(periphDir);
	} else if (slot !== 1 && invEmptySlot !== 1) {
		// Return the item that was moved to make room for the 1st slot
		chest.pushItems(periphDir, invEmptySlot, Number(chest.getItemDetail(invEmptySlot).count), 1);
	}

	return pulledItems;
}
