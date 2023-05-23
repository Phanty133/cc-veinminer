import { Block } from "./BlockMap";
import DigController from "./DigController";
import FuelController from "./FuelController";
import InventoryController, { BlacklistEntry } from "./InventoryController";
import MovementController from "./MovementController";
import SpatialMap from "./SpatialMap";
import VeinMiner from "./VeinMiner";

function orePredicate(block: Block) {
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
];

const INV_CLEAR_BLACKLIST: BlacklistEntry[] = [
	{ name: "minecraft:torch", maxCount: 64 },
	{ name: "minecraft:coal", maxCount: 64 },
	{ name: "minecraft:charcoal", maxCount: 64 },
	{ name: "minecraft:coal_block", maxCount: 64 },
];

const FUEL_TARGET = 500;
const SHAFT_DEPTH = 7;

const fuelController = new FuelController(FUEL_WHITELIST, FUEL_TARGET);
const moveController = new MovementController(fuelController);
const spatialMap = new SpatialMap(moveController);
const digController = new DigController(moveController, spatialMap);
const invController = new InventoryController(INV_CLEAR_BLACKLIST);

const miner = new VeinMiner(
	moveController,
	digController,
	spatialMap,
	orePredicate,
	SHAFT_DEPTH
);

while (true) {
	invController.sortInventory();

	if (invController.isInventoryFull()) {
		invController.clearInventory();
	}

	miner.mineIteration();
}
