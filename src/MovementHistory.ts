export type MoveAction = "FORWARD" | "TURN_LEFT" | "TURN_RIGHT" | "BACK" | "UP" | "DOWN";

/** Stack data structure that tracks movement history */
export default class MovementHistory {
	private _history: MoveAction[];

	public get history() {
		return [...this._history];
	}

	private readonly actionMap: Record<MoveAction, MoveAction> = {
		FORWARD: "BACK",
		TURN_LEFT: "TURN_RIGHT",
		TURN_RIGHT: "TURN_LEFT",
		BACK: "FORWARD",
		UP: "DOWN",
		DOWN: "UP",
	};

	/** Length of history */
	public get length() {
		return this._history.length;
	}

	/**
	 * Initializes movement history
	 */
	constructor() {
		this._history = [];
	}

	/**
	 * Clears movement history
	 */
	clear() {
		this._history = [];
	}

	/**
	 * Deletes the last element in the history
	 * @returns Value of the element that was deleted
	 */
	pop() {
		return this._history.pop();
	}

	/**
	 * Add a new action to the history
	 * @param action Action to add
	 */
	add(action: MoveAction) {
		this._history.push(action);
	}

	/**
	 * Deletes the last element in the history
	 * @returns Reverse action of the action that was deleted from the history
	 */
	popReverse() {
		return this.actionMap[this.pop()];
	}
}
