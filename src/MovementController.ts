import FuelController from "./FuelController";
import MovementHistory, { MoveAction } from "./MovementHistory";
import { BlockDirection, SurroundingBlocks } from "./SpatialMap";

// 1 - left, -1 right
function rotateDirection(direction: Vector, rotate: number) {
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

// Manages movement and tracks position and direction
export default class MovementController {
	_pos: Vector; // Relative position
	_direction: Vector; // Relative direction

	public get pos() { return this._pos; }
	private set pos(val: Vector) { this._pos = val; }

	public get direction() { return this._direction; }
	private set direction(val: Vector) { this._direction = val; }

	readonly history = new MovementHistory();
	trackHistory: boolean = false;

	readonly historyActionMap: { [k in MoveAction]: () => boolean } = {
		"BACK": () => { return this.back(); },
		"DOWN": () => { return this.down(); },
		"FORWARD": () => { return this.forward(); },
		"UP": () => { return this.up(); },
		"TURN_LEFT": () => { return this.turnLeft(); },
		"TURN_RIGHT": () => { return this.turnRight(); }
	};

	fuel: FuelController;

	constructor(fuel: FuelController) {
		this.fuel = fuel;
		this.pos = new Vector(0, 0, 0);

		// x - Left/Right
		// y - Up/Down, Always 0
		// z - Forward/Back
		this.direction = new Vector(0, 0, 1);
	}

	blockDirectionToCoordinates(dir: BlockDirection): Vector {
		switch (dir) {
			case "FRONT":
				return this.pos.add(this.direction);
			case "REAR":
				return this.pos.sub(this.direction);
			case "TOP":
				return this.pos.add(new Vector(0, 1, 0));
			case "BOTTOM":
				return this.pos.add(new Vector(0, -1, 0));
			case "LEFT":
				return this.pos.add(rotateDirection(this.direction, 1));
			case "RIGHT":
				return this.pos.add(rotateDirection(this.direction, -1));
		}
	}

	// 1 - left, -1 right
	private updateDirection(rotate: number) {
		// A really simple direction tracking function
		this.direction = rotateDirection(this.direction, rotate);
	}

	private forwardFueled() {
		this.fuel.ensureFuel();
		return turtle.forward();
	}

	private backFueled() {
		this.fuel.ensureFuel();
		return turtle.back();
	}

	private upFueled() {
		this.fuel.ensureFuel();
		return turtle.up();
	}

	private downFueled() {
		this.fuel.ensureFuel();
		return turtle.down();
	}

	// Moves forward n blocks
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

	// Moves back n blocks
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

	// Moves up n blocks
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

	// Moves down n blocks
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

	forceForward(blocks = 1) {
		for (let i = 0; i < blocks; i++) {
			while (!this.forwardFueled()) {
				turtle.dig();
			}

			this.pos = this.pos.add(this.direction);
			if (this.trackHistory) this.history.add("FORWARD");
		}
	}

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

	forceUp(blocks = 1) {
		for (let i = 0; i < blocks; i++) {			
			while (!this.upFueled()) {
				turtle.digUp();
			}

			this.pos = this.pos.add(new Vector(0, 1, 0));
			if (this.trackHistory) this.history.add("UP");
		}
	}

	forceDown(blocks = 1) {
		for (let i = 0; i < blocks; i++) {
			while (!this.downFueled()) {
				turtle.digDown();
			}

			this.pos = this.pos.add(new Vector(0, -1, 0));
			if (this.trackHistory) this.history.add("DOWN");
		}
	}

	turnRight() {
		turtle.turnRight();
		this.updateDirection(-1);
		if (this.trackHistory) this.history.add("TURN_RIGHT");

		return true;
	}

	turnLeft() {
		turtle.turnLeft();
		this.updateDirection(1);
		if (this.trackHistory) this.history.add("TURN_LEFT");

		return true;
	}

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

	executeMoveAction(action: MoveAction): boolean {
		return this.historyActionMap[action]();
	}

	reverseMove() {
		if (this.history.length === 0) {
			print("WARNING: Attempt to reverse empty history");
			return;
		}

		this.disableHistoryForAction(() => {
			this.executeMoveAction(this.history.popReverse());
		});
	}

	disableHistoryForAction(action: () => void) {
		const origHistoryMode = this.trackHistory;
		this.trackHistory = false;

		action();

		this.trackHistory = origHistoryMode;
	}
}