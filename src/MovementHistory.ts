export type MoveAction = "FORWARD" | "TURN_LEFT" | "TURN_RIGHT" | "BACK" | "UP" | "DOWN";

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

	public get length() {
		return this.history.length;
	}

	constructor() {
		this.history = [];
	}

	clear() {
		this.history = [];
	}

	pop() {
		return this.history.pop();
	}

	add(action: MoveAction) {
		this.history.push(action);
	}

	popReverse() {
		return this.actionMap[this.pop()];
	}
}
