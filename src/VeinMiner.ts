import { Block } from "./BlockMap";
import DigController from "./DigController";
import { findFirstItem } from "./InventoryUtil";
import MovementController from "./MovementController";
import SpatialMap, { BlockDirection, SurroundingBlocks } from "./SpatialMap";
import { BlockId } from "./minecraft";

export default class VeinMiner {
	private movement: MovementController;

	private map: SpatialMap;
	
	private dig: DigController;

	shaftDepth: number;
	
	orePredicate: (name: Block) => boolean;

	constructor(
		movement: MovementController,
		dig: DigController,
		map: SpatialMap,
		orePredicate: (name: Block) => boolean,
		shaftDepth = 7
	) {
		this.movement = movement;
		this.dig = dig;
		this.map = map;
		this.shaftDepth = shaftDepth;
		this.orePredicate = orePredicate;
	}

	placeTorch() {
		const torch = findFirstItem((name) => name === "minecraft:torch");

		if (torch === null) {
			print("WARNING: Out of torches");
			return;
		}

		turtle.select(torch.slot);
		turtle.placeUp();
	}

	mineForward(num = 1) {
		for (let i = 0; i < num; i++) {
			this.dig.digMove("FRONT");
			this.attemptMineOreVein();

			if (turtle.detectUp()) {
				this.dig.digMove("TOP");
				this.attemptMineOreVein();
				this.movement.forceDown();
			}
		}
	}
	
	attemptMineOreVein() {
		this.movement.trackHistory = true;

		while (true) {
			const blocks = this.map.getSurroundings();
			let oreDirection: keyof SurroundingBlocks | null = null;

			for (const dir in blocks) {
				const block = blocks[dir] as Block;

				if (this.orePredicate(block) && block.breakable) {
					print("Breakable: ");
					print(block.breakable);
					oreDirection = dir as BlockDirection;
					break;
				}
			}

			if (oreDirection !== null) {
				this.dig.digMove(oreDirection);
			} else {
				// Revert unless already at the start position
				if (this.movement.history.length === 0) break;

				this.movement.reverseMove();
			}
		}

		this.movement.trackHistory = false;
	}
	
	mineIteration() {
		for (let i = 0; i < 3; i++) {
			this.mineForward();
		}

		this.placeTorch();

		this.movement.turnLeft();
		this.mineForward(this.shaftDepth);

		this.movement.turnLeft();
		this.movement.turnLeft();

		this.movement.forceForward(this.shaftDepth);
		this.mineForward(this.shaftDepth);

		this.movement.forceBack(this.shaftDepth);
		this.movement.turnLeft();
	}
}
