import MovementController from "./MovementController";
import SpatialMap, { BlockDirection } from "./SpatialMap";

const DIG_ERROR = {
	UNBREAKABLE: "UNBREAKABLE",
} as const;

export type DigError = ObjectValues<typeof DIG_ERROR>;

const ERROR_MAP: Record<string, DigError> = {
	"Cannot break unbreakable block": DIG_ERROR.UNBREAKABLE,
};

/** Wraps the native digging functions and integrates them with movement and mapping. */
export default class DigController {
	private move: MovementController;

	private map: SpatialMap;

	constructor(move: MovementController, map: SpatialMap) {
		this.move = move;
		this.map = map;
	}

	/**
	 * Attempts to dig forward if a block is there.
	 * If the block is unbreakable, it will be marked as such in the spatial map.
	 * @param ignoreMap Whether to update the block data in the spatial map
	 * @returns True if successful
	 */
	digForward(ignoreMap = false) {
		if (turtle.detect()) {
			const [digSuccess, error] = turtle.dig();

			if (!digSuccess) {
				if (ERROR_MAP[error] === DIG_ERROR.UNBREAKABLE) {
					print("ERROR: Unable to break block!");
					if (!ignoreMap) this.map.setBlockUnbreakable("FRONT");

					return false;
				}
			}
		}

		if (!ignoreMap) this.map.removeBlock("FRONT");

		return true;
	}

	/**
	 * Attempts to dig up if a block is there.
	 * If the block is unbreakable, it will be marked as such in the spatial map.
	 * @param ignoreMap Whether to update the block data in the spatial map
	 * @returns True if successful
	 */
	digUp(ignoreMap = false) {
		if (turtle.detectUp()) {
			const [digSuccess, error] = turtle.digUp();

			if (!digSuccess) {
				if (ERROR_MAP[error] === DIG_ERROR.UNBREAKABLE) {
					print("ERROR: Unable to break block!");
					if (!ignoreMap) this.map.setBlockUnbreakable("TOP");

					return false;
				}
			}
		}

		if (!ignoreMap) this.map.removeBlock("TOP");

		return true;
	}

	/**
	 * Attempts to dig down if a block is there.
	 * If the block is unbreakable, it will be marked as such in the spatial map.
	 * @param ignoreMap Whether to update the block data in the spatial map
	 * @returns True if successful
	 */
	digDown(ignoreMap = false) {
		if (turtle.detectDown()) {
			const [digSuccess, error] = turtle.digDown();

			if (!digSuccess) {
				if (ERROR_MAP[error] === DIG_ERROR.UNBREAKABLE) {
					print("ERROR: Unable to break block!");
					if (!ignoreMap) this.map.setBlockUnbreakable("BOTTOM");

					return false;
				}
			}
		}

		if (!ignoreMap) this.map.removeBlock("BOTTOM");

		return true;
	}

	/**
	 * Attempts to dig in an arbitrary direction.
	 * If the direction is left, right, or rear, the turtle will rotate itself.
	 * If the block is unbreakable, it will be marked as such in the spatial map.
	 * @param dir Direction to dig in
	 * @param ignoreMap Whether to update the block data in the spatial map
	 * @param resetDirection Whether to reset direction after digging
	 * @returns True if successful
	 */
	dig(dir: BlockDirection, ignoreMap = false, resetDirection = false): boolean {
		let success: boolean;

		// TODO: Switch to safety-match
		// eslint-disable-next-line default-case
		switch (dir) {
			case "TOP":
				success = this.digUp(ignoreMap);
				break;
			case "BOTTOM":
				success = this.digDown(ignoreMap);
				break;
			case "LEFT":
				this.move.turnLeft();
				success = this.digForward(ignoreMap);

				if (resetDirection) this.move.turnRight();
				break;
			case "RIGHT":
				this.move.turnRight();
				success = this.digForward(ignoreMap);

				if (resetDirection) this.move.turnLeft();
				break;
			case "FRONT":
				success = this.digForward(ignoreMap);
				break;
			case "REAR":
				this.move.turnAround();
				success = this.digForward(ignoreMap);

				if (resetDirection) this.move.turnAround();
				break;
		}

		return success;
	}

	/**
	 * Attempts to dig and move in a direction.
	 * If the block is unbreakable, it will be marked as such in the spatial map and the move will fail.
	 * @param dir Direction to dig and move in
	 * @param forced If the move failed, dig until moved
	 * @param ignoreMap Whether to update the block data in the spatial map
	 * @returns True if successful
	 */
	digMove(dir: BlockDirection, forced = false, ignoreMap = false): boolean {
		const success = this.dig(dir, ignoreMap);

		if (!success) return false;

		let moveSuccess = true;

		do {
			if (dir === "TOP") {
				if (!moveSuccess) turtle.digUp();

				moveSuccess = this.move.up();
			} else if (dir === "BOTTOM") {
				if (!moveSuccess) turtle.digUp();

				moveSuccess = this.move.down();
			} else {
				if (!moveSuccess) turtle.dig();

				// .dig() by default leaves the direction facing the block that was mined
				moveSuccess = this.move.forward();
			}
		} while (forced && !moveSuccess);

		return moveSuccess;
	}
}
