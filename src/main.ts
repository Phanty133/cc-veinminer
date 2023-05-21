import FuelController from "./FuelController";
import InventoryController from "./InventoryController";
import MovementController from "./MovementController";
import VeinMiner from "./VeinMiner";
import { BlockId } from "./minecraft";

function orePredicate(name: BlockId) {
	return name.endsWith("ore");
}

const fuelController = new FuelController([
	"minecraft:coal",
	"minecraft:coal_block"
], 500);
const moveController = new MovementController(fuelController);
const invController = new InventoryController([
	{ name: "minecraft:torch", maxCount: 64 },
	{ name: "minecraft:coal", maxCount: 64 },
	{ name: "minecraft:coal_block", maxCount: 64 },
]);
const miner = new VeinMiner(moveController, orePredicate, 5);

while (true) {
	invController.sortInventory();

	if (invController.isInventoryFull()) {
		invController.clearInventory();
	}

	miner.mineIteration();
}
