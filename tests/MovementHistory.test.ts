import {
	expect, describe, test, jest, afterEach,
} from "@jest/globals";
import MovementHistory from "../src/MovementHistory";

describe("OsUtils", () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	test("add", () => {
		const history = new MovementHistory();

		history.add("FORWARD");
		history.add("BACK");

		expect(history.history).toEqual(["FORWARD", "BACK"]);
	});

	test("clear", () => {
		const history = new MovementHistory();

		history.add("FORWARD");
		history.add("FORWARD");

		expect(history.history).toEqual(["FORWARD", "FORWARD"]);
		history.clear();
		expect(history.history).toEqual([]);
	});

	test("pop", () => {
		const history = new MovementHistory();

		history.add("FORWARD");
		history.add("BACK");

		expect(history.pop()).toBe("BACK");
		expect(history.history).toEqual(["FORWARD"]);
	});

	describe("popReverse", () => {
		test("Back", () => {
			const history = new MovementHistory();

			history.add("FORWARD");
			history.add("BACK");

			expect(history.popReverse()).toBe("FORWARD");
			expect(history.history).toEqual(["FORWARD"]);
		});

		test("Forward", () => {
			const history = new MovementHistory();

			history.add("BACK");
			history.add("FORWARD");

			expect(history.popReverse()).toBe("BACK");
			expect(history.history).toEqual(["BACK"]);
		});

		test("Up", () => {
			const history = new MovementHistory();

			history.add("BACK");
			history.add("UP");

			expect(history.popReverse()).toBe("DOWN");
			expect(history.history).toEqual(["BACK"]);
		});

		test("Down", () => {
			const history = new MovementHistory();

			history.add("BACK");
			history.add("DOWN");

			expect(history.popReverse()).toBe("UP");
			expect(history.history).toEqual(["BACK"]);
		});

		test("Turn left", () => {
			const history = new MovementHistory();

			history.add("BACK");
			history.add("TURN_LEFT");

			expect(history.popReverse()).toBe("TURN_RIGHT");
			expect(history.history).toEqual(["BACK"]);
		});

		test("Turn right", () => {
			const history = new MovementHistory();

			history.add("BACK");
			history.add("TURN_RIGHT");

			expect(history.popReverse()).toBe("TURN_LEFT");
			expect(history.history).toEqual(["BACK"]);
		});
	});

	test("length", () => {
		const history = new MovementHistory();

		expect(history.length).toBe(0);

		history.add("FORWARD");
		history.add("FORWARD");
		history.add("FORWARD");

		expect(history.history).toEqual(["FORWARD", "FORWARD", "FORWARD"]);
		expect(history.length).toBe(3);
	});
});
