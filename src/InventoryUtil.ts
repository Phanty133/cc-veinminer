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
