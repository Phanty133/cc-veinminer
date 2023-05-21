import { findFirstItem } from "./InventoryUtil";
import MovementController from "./MovementController";
import SpatialMap, { SurroundingBlocks } from "./SpatialMap";
import { BlockId } from "./minecraft";

export default class VeinMiner {
	movement: MovementController;
	map: SpatialMap;
	shaftDepth: number;
	orePredicate: (name: BlockId) => boolean;

	constructor(
		movement: MovementController,
		orePredicate: (name: BlockId) => boolean,
		shaftDepth = 5
	) {
		this.movement = movement;
		this.map = new SpatialMap(movement);
		this.shaftDepth = shaftDepth;
		this.orePredicate = orePredicate;
	}

	private digUp() {
		turtle.digUp();
		this.map.map.removeBlock(this.movement.blockDirectionToCoordinates("TOP"));
	}

	private digDown() {
		turtle.digDown();
		this.map.map.removeBlock(this.movement.blockDirectionToCoordinates("BOTTOM"));
	}

	private dig() {
		turtle.dig();
		this.map.map.removeBlock(this.movement.blockDirectionToCoordinates("FRONT"));
	}

	private mineInBlockDirection(dir: keyof SurroundingBlocks) {
		switch (dir) {
			case "TOP":
				this.digUp();
				this.movement.forceUp();
				break;
			case "BOTTOM":
				this.digDown();
				this.movement.forceDown();
				break;
			case "LEFT":
				this.movement.turnLeft();
				this.dig();
				this.movement.forceForward();
				break;
			case "RIGHT":
				this.movement.turnRight();
				this.dig();
				this.movement.forceForward();
				break;
			case "FRONT":
				this.dig();
				this.movement.forceForward();
				break;
			case "REAR":
				this.movement.turnLeft();
				this.movement.turnLeft();
				this.dig();
				this.movement.forceForward();
				break;
		}
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
			if (turtle.detect()) this.dig();

			this.movement.forceForward();
			this.attemptMineOreVein();

			if (turtle.detectUp()) {
				this.digUp();
				this.movement.forceUp();
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
				if (this.orePredicate(blocks[dir])) {
					oreDirection = dir as keyof SurroundingBlocks;
					break;
				}
			}

			if (oreDirection !== null) {
				this.mineInBlockDirection(oreDirection);
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
