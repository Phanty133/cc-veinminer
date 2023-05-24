import { MappedBlock } from "./BlockMap";
import DigController from "./DigController";
import { findFirstItem } from "./InventoryUtil";
import MovementController from "./MovementController";
import PathBuilder from "./PathBuilder";
import SpatialMap, { BlockDirection, SurroundingBlocks } from "./SpatialMap";

/**
 * Strip/vein mining controller
 */
export default class VeinMiner {
	private movement: MovementController;

	private map: SpatialMap;

	private dig: DigController;

	private pathBuilder: PathBuilder;

	/** Horizontal shaft length */
	shaftDepth: number;

	orePredicate: (name: MappedBlock) => boolean;

	/**
	 * Initializes the miner
	 * @param movement Movement controller
	 * @param dig Dig controller
	 * @param map Spatial map
	 * @param pathBuilder Path Builder
	 * @param orePredicate Predicate to use to match for ores and other blocks of interest
	 * @param shaftDepth Length of the horizontal shafts
	 */
	constructor(
		movement: MovementController,
		dig: DigController,
		map: SpatialMap,
		pathBuilder: PathBuilder,
		orePredicate: (name: MappedBlock) => boolean,
		shaftDepth = 7,
	) {
		this.movement = movement;
		this.dig = dig;
		this.map = map;
		this.pathBuilder = pathBuilder;
		this.shaftDepth = shaftDepth;
		this.orePredicate = orePredicate;
	}

	// TODO: Make separate torch placer class with placement optimization
	/**
	 * Place torch upward
	 */
	// eslint-disable-next-line class-methods-use-this
	placeTorch() {
		const torch = findFirstItem((item) => item.name === "minecraft:torch");

		if (torch === null) {
			print("WARNING: Out of torches");
			return;
		}

		turtle.select(torch.slot);
		turtle.placeUp();
	}

	/**
	 * Mine forward for `num` blocks
	 * @param num How many blocks to mine
	 */
	mineForward(num = 1) {
		for (let i = 0; i < num; i++) {
			this.dig.digMove("FRONT");
			this.attemptMineOreVein();
			this.pathBuilder.ensurePathBlock();
			this.pathBuilder.ensureNoLiquidBlock();

			this.dig.digMove("TOP");
			this.attemptMineOreVein();
			// this.pathBuilder.ensureNoLiquidBlock();
			this.movement.forceDown();
		}
	}

	/**
	 * Looks for neighboring blocks that match `orePredicate`.
	 * If a matching block is found, mine it out and move to the ore's location.
	 * Continue looking and mining until no blocks of interest are found.
	 * Reverts to the position the method was called in after finishing.
	 */
	attemptMineOreVein() {
		this.movement.trackHistory = true;

		// TODO: Make condition non-constant
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const blocks = this.map.getSurroundings();
			let oreDirection: keyof SurroundingBlocks | null = null;

			for (const dir of Object.keys(blocks)) {
				const block = blocks[dir] as MappedBlock;

				if (this.orePredicate(block) && block.breakable) {
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

	/**
	 * Mines a full Forward/Left-Right shaft iteration.
	 */
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
