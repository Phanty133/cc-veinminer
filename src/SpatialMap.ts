import BlockMap from "./BlockMap";
import MovementController from "./MovementController";
import { BlockId } from "./minecraft";

export type BlockDirection = "FRONT" | "TOP" | "BOTTOM" | "LEFT" | "REAR" | "RIGHT";
export type SurroundingBlocks = { [k in BlockDirection]: BlockId };

// Stores spatial information relative to start position
export default class SpatialMap {
	private movement: MovementController;
	readonly map: BlockMap = new BlockMap();

	constructor(movement: MovementController) {
		this.movement = movement;
	}

	private addFrontBlockToMap() {
		const blockAttempt = turtle.inspect();

		if (!blockAttempt[0]) return;

		const { name } = blockAttempt[1] as { name: string };

		this.map.setBlock(this.movement.blockDirectionToCoordinates("FRONT"), name);
		return name;
	}

	private addTopBlockToMap() {
		const blockAttempt = turtle.inspectUp();

		if (!blockAttempt[0]) return;

		const { name } = blockAttempt[1] as { name: string };
		const blockPos = this.movement.pos.add(new Vector(0, 1, 0));

		this.map.setBlock(blockPos, name);
		return name;
	}

	private addBottomBlockToMap() {
		const blockAttempt = turtle.inspectDown();

		if (!blockAttempt[0]) return;

		const { name } = blockAttempt[1] as { name: string };
		const blockPos = this.movement.pos.add(new Vector(0, -1, 0));

		this.map.setBlock(blockPos, name);
		return name;
	}

	getSurroundings(): SurroundingBlocks {
		const out: Partial<SurroundingBlocks> = {};

		out.FRONT = this.addFrontBlockToMap();
		out.TOP = this.addTopBlockToMap();
		out.BOTTOM = this.addBottomBlockToMap();

		const rearEntry = this.map.getBlockEntry(this.movement.blockDirectionToCoordinates("REAR"));
		const leftEntry = this.map.getBlockEntry(this.movement.blockDirectionToCoordinates("LEFT"));
		const rightEntry = this.map.getBlockEntry(this.movement.blockDirectionToCoordinates("RIGHT"));

		let check: "ALL" | "LEFT" | "RIGHT" | "NONE" = "ALL";

		if (rearEntry?.checked) {
			if (leftEntry?.checked) {
				if (rightEntry?.checked) {
					check = "NONE";
				} else {
					check = "RIGHT";
				}
			} else if (rightEntry?.checked) {
				check = "LEFT";
			}
		}

		if (check !== "NONE") {
			this.movement.disableHistoryForAction(() => {
				if (check === "RIGHT") {
					this.movement.turnRight();
					out.RIGHT = this.addFrontBlockToMap();
					this.movement.turnLeft();
				} else if (check === "LEFT") {
					this.movement.turnLeft();
					out.LEFT = this.addFrontBlockToMap();
					this.movement.turnRight();
				} else {
					this.movement.turnLeft();
					out.LEFT = this.addFrontBlockToMap();

					this.movement.turnLeft();
					out.REAR = this.addFrontBlockToMap();

					this.movement.turnLeft();
					out.RIGHT = this.addFrontBlockToMap();

					this.movement.turnLeft();
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
