export function getItem(slot: number): ItemDetail | null {
	const itemAttempt = turtle.getItemDetail(slot);

	return (itemAttempt as ItemDetail) ?? null;
}

export function findFirstItem(
	predicate: (name: string, slot: number) => boolean,
): { slot: number, item: string } | null {
	for (let slot = 1; slot <= 16; slot++) {
		const item = getItem(slot);

		if (item) {
			if (predicate(item.name, slot)) return { slot: Number(slot), item: item.name };
		}
	}

	return null;
}
