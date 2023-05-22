import BlockMap, { Block } from "./BlockMap";
import MovementController, { rotateDirection } from "./MovementController";
import { BlockId } from "./minecraft";

export type BlockDirection = "FRONT" | "TOP" | "BOTTOM" | "LEFT" | "REAR" | "RIGHT";
export type SurroundingBlocks = { [k in BlockDirection]: Block };

// Stores spatial information relative to start position
export default class SpatialMap {
	private move: MovementController;

	readonly map: BlockMap = new BlockMap();

	constructor(movement: MovementController) {
		this.move = movement;
	}

	private addFrontBlockToMap() {
		const blockAttempt = turtle.inspect();

		if (!blockAttempt[0]) return;

		const { name } = blockAttempt[1] as { name: string };
		const blockPos = this.blockDirectionToCoordinates("FRONT");

		return this.map.setBlock(blockPos, name);
	}

	private addTopBlockToMap() {
		const blockAttempt = turtle.inspectUp();

		if (!blockAttempt[0]) return;

		const { name } = blockAttempt[1] as { name: string };
		const blockPos = this.move.pos.add(new Vector(0, 1, 0));

		return this.map.setBlock(blockPos, name);
	}

	private addBottomBlockToMap() {
		const blockAttempt = turtle.inspectDown();

		if (!blockAttempt[0]) return;

		const { name } = blockAttempt[1] as { name: string };
		const blockPos = this.move.pos.add(new Vector(0, -1, 0));

		return this.map.setBlock(blockPos, name);
	}

	blockDirectionToCoordinates(dir: BlockDirection): Vector {
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

	getBlock(dir: BlockDirection): Block | null {
		return this.map.getBlockEntry(this.blockDirectionToCoordinates(dir));
	}

	removeBlock(dir: BlockDirection): boolean {
		return this.map.removeBlock(this.blockDirectionToCoordinates(dir));
	}

	setBlockUnbreakable(dir: BlockDirection): boolean {
		return this.map.setUnbreakable(this.blockDirectionToCoordinates(dir));
	}

	getSurroundings(): SurroundingBlocks {
		const out: Partial<SurroundingBlocks> = {};

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

	static printBlocks(blocks: SurroundingBlocks) {
		for (const k in blocks) {
			print(`${k}: ${blocks[k]}`);
		}
	}
}
