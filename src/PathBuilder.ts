import { forSlot } from "./InventoryUtil";
import MovementController from "./MovementController";
import SpatialMap, { BlockDirection } from "./SpatialMap";
import { TurtleUtils } from "./TurtleUtils";
import { BlockId } from "./minecraft";

/** Manages block placement to block off fluids and ensure a walkable mining tunnel */
export default class PathBuilder {
	blockWhitelist: BlockId[];

	fluidWhitelist: BlockId[];

	move: MovementController;

	map: SpatialMap;

	/**
	 * Initializes the path builder
	 * @param blockWhitelist Array of blocks to use for building. Prioritizes blocks with lowest index
	 * @param fluidWhitelist Array of fluid block IDs to block off
	 * @param move The movement controller
	 * @param map The spatial map
	 */
	constructor(
		blockWhitelist: BlockId[],
		fluidWhitelist: BlockId[],
		move: MovementController,
		map: SpatialMap,
	) {
		this.blockWhitelist = blockWhitelist;
		this.fluidWhitelist = fluidWhitelist;
		this.move = move;
		this.map = map;
	}

	private placeBlockOnSide(side: BlockDirection, resetDirection = false) {
		let success: boolean;

		// eslint-disable-next-line default-case
		switch (side) {
			case "TOP":
				success = turtle.placeUp();
				break;
			case "BOTTOM":
				success = turtle.placeDown();
				break;
			case "FRONT":
				success = turtle.place();
				break;
			case "LEFT":
				this.move.turnLeft();
				success = turtle.place();
				if (resetDirection) this.move.turnRight();

				break;
			case "RIGHT":
				this.move.turnRight();
				success = turtle.place();
				if (resetDirection) this.move.turnLeft();

				break;
			case "REAR":
				this.move.turnAround();
				success = turtle.place();
				if (resetDirection) this.move.turnAround();

				break;
		}

		return success;
	}

	/**
	 * Gets the first valid building block, ordered by slot and order in the whitelist
	 * @returns Item slot and data if found, `null` otherwise
	 */
	private getBuildingBlock() {
		const matchingItems: { slot: number, item: ItemDetail }[] = [];

		forSlot((slot, item) => {
			if (this.blockWhitelist.includes(item?.name)) {
				matchingItems.push({ slot, item });
			}
		});

		// Prioritize a lower index and lower slot
		matchingItems.sort((a, b) => {
			const aIndex = this.blockWhitelist.indexOf(a.item.name);
			const bIndex = this.blockWhitelist.indexOf(b.item.name);

			if (aIndex === bIndex) {
				return a.slot - b.slot;
			}

			return aIndex - bIndex;
		});

		return matchingItems[0] ?? null;
	}

	/**
	 * Ensures that the block beneath the turtle is walkable
	 */
	ensurePathBlock() {
		const bottomBlock = TurtleUtils.inspectDown();

		if (
			bottomBlock !== null
			&& !this.fluidWhitelist.includes(bottomBlock?.name)
		) return;

		const buildingBlock = this.getBuildingBlock();

		if (buildingBlock === null) {
			print("WARNING: No valid building blocks in inventory");
			return;
		}

		turtle.select(buildingBlock.slot);
		const placed = turtle.placeDown();

		if (!placed) print("WARNING: Failed to place path block");
	}

	/**
	 * Ensures that the block that the block in front of the turtle is not a liquid block
	 */
	ensureNoLiquidBlock() {
		const blocks = this.map.getSurroundings();
		const fluidSides: BlockDirection[] = [];

		for (const k of Object.keys(blocks)) {
			const side = k as BlockDirection;
			const b = blocks[side];

			if (this.fluidWhitelist.includes(b.name)) {
				fluidSides.push(side);
			}
		}

		for (const side of fluidSides) {
			const buildingBlock = this.getBuildingBlock();

			if (buildingBlock === null) {
				print("WARNING: No valid building blocks in inventory");
				break;
			}

			if (!this.placeBlockOnSide(side, true)) {
				print("WARNING: Failed to place fluid wall block");
			}
		}
	}
}
