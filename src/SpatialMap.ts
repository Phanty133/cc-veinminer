import BlockMap, { MappedBlock } from "./BlockMap";
import MovementController, { rotateDirection } from "./MovementController";
import { TurtleUtils } from "./TurtleUtils";

export type BlockDirection = "FRONT" | "TOP" | "BOTTOM" | "LEFT" | "REAR" | "RIGHT";
export type SurroundingBlocks = { [k in BlockDirection]: MappedBlock };

/** Stores spatial information relative to the turtle's start position */
export default class SpatialMap {
	private move: MovementController;

	readonly map: BlockMap = new BlockMap();

	constructor(movement: MovementController) {
		this.move = movement;
	}

	/**
	 * Adds the block in front to the block map
	 * @returns Block data that was added, `null` if no block added
	 */
	private addFrontBlockToMap(): MappedBlock | null {
		const block = TurtleUtils.inspect();
		const name = block?.name ?? null;
		const blockPos = this.blockDirectionToCoordinates("FRONT");

		return this.map.setBlock(blockPos, name);
	}

	/**
	 * Adds the upward block to the block map
	 * @returns Block data that was added, `null` if no block added
	 */
	private addTopBlockToMap(): MappedBlock | null {
		const block = TurtleUtils.inspectUp();
		const name = block?.name ?? null;
		const blockPos = this.move.pos.add(new Vector(0, 1, 0));

		return this.map.setBlock(blockPos, name);
	}

	/**
	 * Adds the bottom block to the block map
	 * @returns Block data that was added, `null` if no block added
	 */
	private addBottomBlockToMap(): MappedBlock | null {
		const block = TurtleUtils.inspectDown();
		const name = block?.name ?? null;
		const blockPos = this.move.pos.add(new Vector(0, -1, 0));

		return this.map.setBlock(blockPos, name);
	}

	/**
	 * Converts block direction to coordinates relative to the turtle's starting position.
	 * @param dir Direction of the block relative to the current turtle's direction
	 * @returns Vector position of the block
	 */
	// eslint-disable-next-line consistent-return
	blockDirectionToCoordinates(dir: BlockDirection): Vector {
		// TODO: Switch to safety-match
		// eslint-disable-next-line default-case
		switch (dir) {
			case "FRONT":
				return this.move.pos.add(this.move.direction);
			case "REAR":
				return this.move.pos.sub(this.move.direction);
			case "TOP":
				return this.move.pos.add(new Vector(0, 1, 0));
			case "BOTTOM":
				return this.move.pos.add(new Vector(0, -1, 0));
			case "LEFT":
				return this.move.pos.add(rotateDirection(this.move.direction, 1));
			case "RIGHT":
				return this.move.pos.add(rotateDirection(this.move.direction, -1));
		}
	}

	/**
	 * Gets a block in a direction
	 * @param dir Direction of the block relative to the current turtle's direction
	 * @returns Block data if found, null if no block.
	 */
	getBlock(dir: BlockDirection): MappedBlock | null {
		return this.map.getBlockEntry(this.blockDirectionToCoordinates(dir));
	}

	/**
	 * Removes a block in a direction from the map
	 * @param dir Direction of the block relative to the current turtle's direction
	 * @returns True if delete successful
	 */
	removeBlock(dir: BlockDirection): boolean {
		return this.map.removeBlock(this.blockDirectionToCoordinates(dir));
	}

	/**
	 * Marks a block in a direction as unbreakable
	 * @param dir Direction of the block relative to the current turtle's direction
	 * @returns True if block successfully marked as unbreakable
	 */
	setBlockUnbreakable(dir: BlockDirection): boolean {
		return this.map.setUnbreakable(this.blockDirectionToCoordinates(dir));
	}

	/**
	 * Returns the blocks currently surrounding the turtle
	 * @returns Block data of the surrounding blocks
	 */
	getSurroundings(): SurroundingBlocks {
		const out: Partial<SurroundingBlocks> = {};

		for (const k of Object.keys(out)) {
			print(Object.keys(out).length);
			print(`${k}: ${out[k].checked}`);
		}

		out.FRONT = this.addFrontBlockToMap();
		out.TOP = this.addTopBlockToMap();
		out.BOTTOM = this.addBottomBlockToMap();

		out.REAR = this.getBlock("REAR");
		out.LEFT = this.getBlock("LEFT");
		out.RIGHT = this.getBlock("RIGHT");

		let check: "ALL" | "LEFT" | "RIGHT" | "NONE" = "ALL";

		if (out.REAR?.checked) {
			if (out.LEFT?.checked) {
				if (out.RIGHT?.checked) {
					check = "NONE";
				} else {
					check = "RIGHT";
				}
			} else if (out.RIGHT?.checked) {
				check = "LEFT";
			}
		}

		if (check !== "NONE") {
			this.move.disableHistoryForAction(() => {
				if (check === "RIGHT") {
					this.move.turnRight();
					out.RIGHT = this.addFrontBlockToMap();
					this.move.turnLeft();
				} else if (check === "LEFT") {
					this.move.turnLeft();
					out.LEFT = this.addFrontBlockToMap();
					this.move.turnRight();
				} else {
					this.move.turnLeft();
					out.LEFT = this.addFrontBlockToMap();

					this.move.turnLeft();
					out.REAR = this.addFrontBlockToMap();

					this.move.turnLeft();
					out.RIGHT = this.addFrontBlockToMap();

					this.move.turnLeft();
				}
			});
		}

		return out as SurroundingBlocks;
	}

	/**
	 * Pretty-prints surrounding blocks
	 * @param blocks Surrounding block the data to print
	 */
	static printBlocks(blocks: SurroundingBlocks) {
		for (const k of Object.keys(blocks)) {
			print(`${k}: ${blocks[k]}`);
		}
	}
}
