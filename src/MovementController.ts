import FuelController from "./FuelController";
import MovementHistory, { MoveAction } from "./MovementHistory";

/**
 * Rotates the direction vector by 90 degrees
 * @param direction Direction vector to rotate
 * @param rotate Rotation direction. Left=1, Right=-1
 * @returns Copy of rotated direction vector
 */
export function rotateDirection(direction: Vector, rotate: number) {
	// Rotation via complex numbers would've been overkill
	const newDirection = new Vector(0, 0, 0);

	if (direction.x !== 0) { // Turtle facing left/right
		newDirection.z = -direction.x * rotate;
		newDirection.x = 0;
	} else if (direction.z !== 0) { // Turtle facing forward/back
		newDirection.x = direction.z * rotate;
		newDirection.z = 0;
	}

	return newDirection;
}

/** Manages movement and tracks position and direction */
export default class MovementController {
	_pos: Vector; // Relative position

	_direction: Vector; // Relative direction

	/** Current relative position of the turtle */
	public get pos() { return this._pos; }

	private set pos(val: Vector) { this._pos = val; }

	/** Current relative direction of the turtle */
	public get direction() { return this._direction; }

	private set direction(val: Vector) { this._direction = val; }

	/** Movement history. Filled only if `trackHistory=true` */
	readonly history = new MovementHistory();

	trackHistory: boolean = false;

	/** Map action enum to method */
	readonly historyActionMap: { [k in MoveAction]: () => boolean } = {
		BACK: () => this.back(),
		DOWN: () => this.down(),
		FORWARD: () => this.forward(),
		UP: () => this.up(),
		TURN_LEFT: () => this.turnLeft(),
		TURN_RIGHT: () => this.turnRight(),
	};

	fuel: FuelController;

	/** Initializes MovementController.
	 *  Sets current coordinates as (0,0,0) and direction as forward. */
	constructor(fuel: FuelController) {
		this.fuel = fuel;
		this.pos = new Vector(0, 0, 0);

		// x - Left/Right
		// y - Up/Down, Always 0
		// z - Forward/Back
		this.direction = new Vector(0, 0, 1);
	}

	/**
	 * Ensures fuel and attempts to move forward
	 * @returns Return value of turtle.forward()
	 */
	private forwardFueled() {
		this.fuel.ensureFuel();
		return turtle.forward();
	}

	/**
	 * Ensures fuel and attempts to move back
	 * @returns Return value of turtle.back()
	 */
	private backFueled() {
		this.fuel.ensureFuel();
		return turtle.back();
	}

	/**
	 * Ensures fuel and attempts to move up
	 * @returns Return value of turtle.up()
	 */
	private upFueled() {
		this.fuel.ensureFuel();
		return turtle.up();
	}

	/**
	 * Ensures fuel and attempts to move down
	 * @returns Return value of turtle.down()
	 */
	private downFueled() {
		this.fuel.ensureFuel();
		return turtle.down();
	}

	/**
	 * Moves forward `blocks` times.
	 * @param blocks How many blocks to move (Default: `1`)
	 * @returns True if move successful
	 */
	forward(blocks = 1): boolean {
		let moveSuccess = true;

		for (let i = 0; i < blocks; i++) {
			if (!this.forwardFueled()) {
				moveSuccess = false;
				break;
			}

			this.pos = this.pos.add(this.direction);
			if (this.trackHistory) this.history.add("FORWARD");
		}

		return moveSuccess;
	}

	/**
	 * Moves back `blocks` times.
	 * @param blocks How many blocks to move (Default: `1`)
	 * @returns True if move successful
	 */
	back(blocks = 1): boolean {
		let moveSuccess = true;

		for (let i = 0; i < blocks; i++) {
			if (!this.backFueled()) {
				moveSuccess = false;
				break;
			}

			this.pos = this.pos.sub(this.direction);
			if (this.trackHistory) this.history.add("BACK");
		}

		return moveSuccess;
	}

	/**
	 * Moves up `blocks` times.
	 * @param blocks How many blocks to move (Default: `1`)
	 * @returns True if move successful
	 */
	up(blocks = 1): boolean {
		let moveSuccess = true;

		for (let i = 0; i < blocks; i++) {
			if (!this.upFueled()) {
				moveSuccess = false;
				break;
			}

			this.pos = this.pos.add(new Vector(0, 1, 0));
			if (this.trackHistory) this.history.add("UP");
		}

		return moveSuccess;
	}

	/**
	 * Moves down `blocks` times.
	 * @param blocks How many blocks to move (Default: `1`)
	 * @returns True if move successful
	 */
	down(blocks = 1): boolean {
		let moveSuccess = true;

		for (let i = 0; i < blocks; i++) {
			if (!this.downFueled()) {
				moveSuccess = false;
				break;
			}

			this.pos = this.pos.sub(new Vector(0, 1, 0));
			if (this.trackHistory) this.history.add("DOWN");
		}

		return moveSuccess;
	}

	/**
	 * Moves forward `blocks` times. If the move fails, dig until successful.
	 * @param blocks How many blocks forward to move (Default: `1`)
	 */
	forceForward(blocks = 1) {
		for (let i = 0; i < blocks; i++) {
			while (!this.forwardFueled()) {
				turtle.dig();
			}

			this.pos = this.pos.add(this.direction);
			if (this.trackHistory) this.history.add("FORWARD");
		}
	}

	/**
	 * Moves back `blocks` times. If the move fails, dig until successful.
	 * @param blocks How many blocks forward to move (Default: `1`)
	 */
	forceBack(blocks = 1) {
		for (let i = 0; i < blocks; i++) {
			if (!this.backFueled()) {
				turtle.turnLeft();
				turtle.turnLeft();

				while (!this.forwardFueled()) {
					turtle.dig();
				}

				turtle.turnLeft();
				turtle.turnLeft();
			}

			this.pos = this.pos.add(this.direction);
			if (this.trackHistory) this.history.add("FORWARD");
		}
	}

	/**
	 * Moves up `blocks` times. If the move fails, dig until successful.
	 * @param blocks How many blocks forward to move (Default: `1`)
	 */
	forceUp(blocks = 1) {
		for (let i = 0; i < blocks; i++) {
			while (!this.upFueled()) {
				turtle.digUp();
			}

			this.pos = this.pos.add(new Vector(0, 1, 0));
			if (this.trackHistory) this.history.add("UP");
		}
	}

	/**
	 * Moves down `blocks` times. If the move fails, dig until successful.
	 * @param blocks How many blocks forward to move (Default: `1`)
	 */
	forceDown(blocks = 1) {
		for (let i = 0; i < blocks; i++) {
			while (!this.downFueled()) {
				turtle.digDown();
			}

			this.pos = this.pos.add(new Vector(0, -1, 0));
			if (this.trackHistory) this.history.add("DOWN");
		}
	}

	/**
	 * Turns 90 degrees right
	 * @returns Always true to match with other movement commands
	 */
	turnRight() {
		turtle.turnRight();
		this.direction = rotateDirection(this.direction, -1);
		if (this.trackHistory) this.history.add("TURN_RIGHT");

		return true;
	}

	/**
	 * Turns 90 degrees left
	 * @returns Always true to match with other movement commands
	 */
	turnLeft() {
		turtle.turnLeft();
		this.direction = rotateDirection(this.direction, 1);
		if (this.trackHistory) this.history.add("TURN_LEFT");

		return true;
	}

	/**
	 * Turns 180 degrees.
	 * @param direction Direction to rotate in. Counterclockwise=1, Clockwise=-1
	 */
	turnAround(direction = 1) {
		if (direction === 1) {
			this.turnLeft();
			this.turnLeft();
		} else {
			this.turnRight();
			this.turnRight();
		}
	}

	/**
	 * Reset direction to the direction the turtle was initialized in.
	 */
	resetToForward() {
		if (this.direction.z === 1) return;

		if (this.direction.z === -1) {
			this.turnLeft();
			this.turnLeft();
		} else if (this.direction.x === -1) {
			this.turnRight();
		} else {
			this.turnLeft();
		}
	}

	/**
	 * Executes a move action based on the argument
	 * @param action Move action to make
	 * @returns Whether action successful
	 */
	executeMoveAction(action: MoveAction): boolean {
		return this.historyActionMap[action]();
	}

	/**
	 * Reverse the last movement action in the movement history
	 */
	reverseMove() {
		if (this.history.length === 0) {
			print("WARNING: Attempt to reverse empty history");
			return;
		}

		this.disableHistoryForAction(() => {
			this.executeMoveAction(this.history.popReverse());
		});
	}

	/**
	 * Executes the callback with a guaranteed disabled movement history.
	 * After execution completes, `trackHistory` returns to value at the time of method call.
	 * @param action Callback to execute
	 */
	disableHistoryForAction(action: () => void) {
		const origHistoryMode = this.trackHistory;
		this.trackHistory = false;

		action();

		this.trackHistory = origHistoryMode;
	}
}
