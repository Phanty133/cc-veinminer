import { jest } from "@jest/globals";
import InventoryPeripheral from "../__mocks__/InventoryPeripheral";

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
	invEdit?: (inv: Record<number, ItemDetail>) => Record<number, ItemDetail>,
): [jest.SpiedFunction<typeof global.peripheral.wrap>, InventoryPeripheral] {
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

	if (invEdit) inventory = invEdit(inventory);
	const invPeripheral = new InventoryPeripheral(30, inventory);

	const func = jest.spyOn(global.peripheral, "wrap")
		.mockImplementationOnce(() => invPeripheral);

	return [func, invPeripheral];
}
