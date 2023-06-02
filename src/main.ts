import { MappedBlock } from "./BlockMap";
import DigController from "./DigController";
import FuelController from "./FuelController";
import InventoryController, { BlacklistEntry, SupplyEntry } from "./InventoryController";
import MovementController from "./MovementController";
import SpatialMap from "./SpatialMap";
import VeinMiner from "./VeinMiner";
import PathBuilder from "./PathBuilder";

function orePredicate(block: MappedBlock) {
	if (block === null) return false;

	const ADDITIONAL_BLOCKS = [
		"minecraft:ancient_debris",
	];

	// Sometimes a nil gets past the check? dunno why; I'm not a Lua dev
	try {
		return block.name.includes("ore") || ADDITIONAL_BLOCKS.includes(block.name);
	} catch {
		return false;
	}
}

const FUEL_WHITELIST = [
	"minecraft:coal",
	"minecraft:coal_block",
	"minecraft:charcoal",
	"minecraft:coal_block",
	"minecraft:lava_bucket",
];

const INV_CLEAR_BLACKLIST: BlacklistEntry[] = [
	{ name: "minecraft:coal", maxCount: 64 },
	{ name: "minecraft:charcoal", maxCount: 64 },
	{ name: "minecraft:coal_block", maxCount: 64 },
];

const INV_RESUPPLY: SupplyEntry[] = [
	{ name: "minecraft:torch", count: 64 },
	{ name: "minecraft:coal", count: 64 },
	{ name: "minecraft:lava_bucket", count: 1 },
];

const BUILDING_BLOCKS = [
	"minecraft:cobblestone",
];

const FLUID_BLOCKS = [
	"minecraft:water",
	"minecraft:lava",
];

const FUEL_TARGET = 5000;
const SHAFT_DEPTH = 7;

const invController = new InventoryController(INV_CLEAR_BLACKLIST, INV_RESUPPLY);
const fuelController = new FuelController(FUEL_WHITELIST, FUEL_TARGET, invController);
const moveController = new MovementController(fuelController);
const spatialMap = new SpatialMap(moveController);
const digController = new DigController(moveController, spatialMap);

const pathBuilder = new PathBuilder(
	BUILDING_BLOCKS,
	FLUID_BLOCKS,
	moveController,
	spatialMap,
);
const miner = new VeinMiner(
	moveController,
	digController,
	spatialMap,
	pathBuilder,
	orePredicate,
	SHAFT_DEPTH,
);

// eslint-disable-next-line no-constant-condition
while (true) {
	invController.sortInventory();

	if (invController.isInventoryFull()) {
		invController.refreshInventory();
	}

	miner.mineIteration();
}
