import { jest } from "@jest/globals";
import InventoryPeripheral from "../__mocks__/InventoryPeripheral";
import { TurtleUtils } from "../../src/TurtleUtils";

export function mockTurtleInventory(): [jest.SpiedFunction<typeof global.turtle.getItemDetail>, Record<number, ItemDetail>] {
	const inventory: Record<number, ItemDetail> = {
		1: {
			name: "minecraft:lava_bucket",
			count: 1,
			displayName: "Lava bucket",
			maxCount: 1,
			tags: [],
		},
		2: {
			name: "minecraft:coal",
			count: 20,
			displayName: "Coal",
			maxCount: 64,
			tags: [],
		},
		4: {
			name: "minecraft:cobblestone",
			count: 42,
			displayName: "Cobblestone",
			maxCount: 64,
			tags: [],
		},
		10: {
			name: "minecraft:cobblestone",
			count: 10,
			displayName: "Cobblestone",
			maxCount: 64,
			tags: [],
		},
		13: {
			name: "minecraft:iron_ore",
			count: 12,
			displayName: "Iron ore",
			maxCount: 64,
			tags: [],
		},
	};

	const func = jest.spyOn(global.turtle, "getItemDetail")
		.mockImplementation((slot) => inventory[slot] ?? null);

	return [func, inventory];
}

export function mockInventoryPeripheral(
	invEdit?: (inv: Record<number, ItemDetail>, size: number) => { inventory: Record<number, ItemDetail>, size: number },
): { spy: jest.SpiedFunction<typeof global.peripheral.wrap>, peripheral: InventoryPeripheral} {
	let inventory: Record<number, ItemDetail> = {
		1: {
			name: "minecraft:coal",
			count: 20,
			displayName: "Coal",
			maxCount: 64,
			tags: [],
		},
		2: {
			name: "minecraft:lava_bucket",
			count: 1,
			displayName: "Lava bucket",
			maxCount: 1,
			tags: [],
		},
		4: {
			name: "minecraft:cobblestone",
			count: 42,
			displayName: "Cobblestone",
			maxCount: 64,
			tags: [],
		},
		10: {
			name: "minecraft:cobblestone",
			count: 10,
			displayName: "Cobblestone",
			maxCount: 64,
			tags: [],
		},
		13: {
			name: "minecraft:iron_ore",
			count: 12,
			displayName: "Iron ore",
			maxCount: 64,
			tags: [],
		},
	};
	let size = 30;

	if (invEdit) {
		const edited = invEdit(inventory, size);
		inventory = edited.inventory;
		size = edited.size;
	}

	const peripheral = new InventoryPeripheral(size, inventory);
	const func = jest.spyOn(global.peripheral, "wrap")
		.mockImplementation(() => peripheral);

	return { spy: func, peripheral };
}

export function mockTurtleSuckDirection(invPeripheral: InventoryPeripheral) {
	return jest
		.spyOn(TurtleUtils, "suckDirection")
		.mockImplementation(() => {
			invPeripheral.suckItem();
		});
}

export function mockTurtleDropDirection(invPeripheral: InventoryPeripheral, item: ItemDetail) {
	return jest
		.spyOn(TurtleUtils, "dropDirection")
		.mockImplementation((dir: string, count = 64) => {
			invPeripheral.dropItem(item, count);
		});
}
