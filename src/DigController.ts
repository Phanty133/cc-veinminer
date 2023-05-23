import MovementController from "./MovementController";
import SpatialMap, { BlockDirection } from "./SpatialMap";

const DIG_ERROR = {
	UNBREAKABLE: "UNBREAKABLE",
} as const;

export type DigError = ObjectValues<typeof DIG_ERROR>;

const ERROR_MAP: Record<string, DigError> = {
	"Cannot break unbreakable block": DIG_ERROR.UNBREAKABLE,
};

export default class DigController {
	private move: MovementController;

	private map: SpatialMap;

	constructor(move: MovementController, map: SpatialMap) {
		this.move = move;
		this.map = map;
	}

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

	digMove(dir: BlockDirection, ignoreMap = false): boolean {
		const success = this.dig(dir, ignoreMap);

		if (!success) return false;

		if (dir === "TOP") {
			this.move.up();
		} else if (dir === "BOTTOM") {
			this.move.down();
		} else {
			// .dig() by default leaves the direction facing the block that was mined
			this.move.forward();
		}

		return true;
	}
}
