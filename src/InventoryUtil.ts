export function findFirstItem(predicate: (name: string, slot: number) => boolean): { slot: number, item: string } | null {
	for (let slot = 1; slot <= 16; slot++) {
		const itemAttempt = turtle.getItemDetail(slot);

		if (itemAttempt) {
			const item = itemAttempt as ItemDetail;

			if (predicate(item.name, slot)) return { slot: Number(slot), item: item.name };
		}
	}
	
	return null;
}