export type MoveAction = "FORWARD" | "TURN_LEFT" | "TURN_RIGHT" | "BACK" | "UP" | "DOWN";

/** Stack data structure that tracks movement history */
export default class MovementHistory {
	private history: MoveAction[];

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
		return this.history.length;
	}

	/**
	 * Initializes movement history
	 */
	constructor() {
		this.history = [];
	}

	/**
	 * Clears movement history
	 */
	clear() {
		this.history = [];
	}

	/**
	 * Deletes the last element in the history
	 * @returns Value of the element that was deleted
	 */
	pop() {
		return this.history.pop();
	}

	/**
	 * Add a new action to the history
	 * @param action Action to add
	 */
	add(action: MoveAction) {
		this.history.push(action);
	}

	/**
	 * Deletes the last element in the history
	 * @returns Reverse action of the action that was deleted from the history
	 */
	popReverse() {
		return this.actionMap[this.pop()];
	}
}
