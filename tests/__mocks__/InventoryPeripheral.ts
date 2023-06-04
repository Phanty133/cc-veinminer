// Again, more of a fake than a mock, but it just felt more straightforward
// Narrator: It was not more straightforward.
export default class InventoryPeripheral {
	private invSize: number;

	private invItems: Record<number, ItemDetail>;

	constructor(size: number = 30, items: Record<number, ItemDetail> | null = null) {
		this.invSize = size;
		this.invItems = items ?? {};
	}

	private firstEmptySlot() {
		// Pretty stupid, but simple
		for (let i = 1; i < this.invSize; i++) {
			if (i in this.invItems) return i;
		}

		return -1;
	}

	size(): number {
		return this.invSize;
	}

	list(): Record<number, ItemDetail> {
		return this.invItems;
	}

	getItemDetail(slot: number): ItemDetail | null {
		return this.invItems[slot] ?? null;
	}

	// eslint-disable-next-line class-methods-use-this
	getItemLimit(): number {
		return 64;
	}

	// This method assumes that the inventory being pushed to is the object instance's own.
	// If you need to push to a different InventoryPeripheral, overwrite the implementation.
	pushItems(fromName: string, fromSlot: number, limit?: number, toSlot?: number): number {
		if (fromSlot <= 0 || fromSlot > this.invSize) return 0;

		const moveFromSlot = fromSlot;
		const moveToSlot = toSlot ?? this.firstEmptySlot();

		if (!this.invItems[moveFromSlot]) return 0;
		if (moveToSlot <= 0 || moveToSlot > this.invSize) return 0;
		if (
			this.invItems[moveToSlot]
			&& this.invItems[moveToSlot].name !== this.invItems[moveFromSlot]?.name
		) return 0;

		const moveAmount = Math.min(
			limit ?? 64,
			64 - (this.invItems[moveToSlot]?.count ?? 0),
			this.invItems[moveFromSlot]!.count,
		);

		// Remove from source
		this.invItems[moveFromSlot]!.count -= moveAmount;

		if (this.invItems[moveToSlot]) {
			this.invItems[moveToSlot]!.count += moveAmount;
		} else {
			this.invItems[moveToSlot] = {
				...this.invItems[moveFromSlot],
				count: moveAmount,
			};
		}

		if (this.invItems[moveFromSlot]!.count === 0) this.invItems[moveFromSlot] = null;

		return moveAmount;
	}

	// This method assumes that the inventory being pushed to is the object instance's own.
	// If you need to push to a different InventoryPeripheral, overwrite the implementation.
	pullItems(fromName: string, fromSlot: number, limit?: number, toSlot?: number): number {
		return this.pushItems(fromName, fromSlot, limit, toSlot);
	}

	removeItem(slot: number): ItemDetail | null {
		const item = this.invItems[slot];

		if (!item) return null;

		delete this.invItems[slot];
		return item;
	}

	suckItem(): ItemDetail | null {
		return this.removeItem(1);
	}

	dropItem(item: ItemDetail, count: number): number {
		let emptySlot: number | null = null;
		let remainingCount = count;

		for (let slot = 1; slot < this.invSize; slot++) {
			const invItem = this.invItems[slot];

			if (!invItem) {
				if (emptySlot === null) emptySlot = slot;

				continue;
			}

			if (invItem.name === item.name && invItem.count < invItem.maxCount) {
				const insertCount = Math.min(remainingCount, invItem.maxCount - invItem.count);
				this.invItems[slot].count += insertCount;
				remainingCount -= insertCount;
			}
		}

		// Check if all possible items already inserted
		if (remainingCount > 0 && emptySlot === -1) return count - remainingCount;
		this.invItems[emptySlot] = item;
		this.invItems[emptySlot].count = remainingCount;

		return count;
	}
}
