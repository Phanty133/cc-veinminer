import FuelController from "./FuelController";
import MovementController from "./MovementController";
import SpatialMap from "./SpatialMap";
import VeinMiner from "./VeinMiner";
import { BlockId } from "./minecraft";

function orePredicate(name: BlockId) {
	return name.endsWith("ore");
}

const moveController = new MovementController();
const fuelController = new FuelController(["minecraft:coal"], 100);
const miner = new VeinMiner(moveController, orePredicate, 5);

while (true) {
	fuelController.ensureFuel();
	miner.mineIteration();
}
