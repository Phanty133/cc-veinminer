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
 * Finds the first item that matches the predicate
 * @param predicate Predicate to use for item matching
 * @returns Item data and slot if found, `null` if item not found
 */
export function findFirstItem(
	predicate: (name: ItemDetail, slot: number) => boolean,
): { slot: number, item: ItemDetail } | null {
	for (let slot = 1; slot <= 16; slot++) {
		const item = getItem(slot);

		if (item) {
			if (predicate(item, slot)) return { slot: Number(slot), item };
		}
	}

	return null;
}
