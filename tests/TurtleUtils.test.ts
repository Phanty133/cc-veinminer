import {
	expect, describe, test, jest, afterEach,
} from "@jest/globals";
import { TurtleUtils } from "../src/TurtleUtils";
import { Block } from "../src/minecraft";

describe("TurtleUtils", () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("inspect", () => {
		test("No block", () => {
			jest.spyOn(global.turtle, "inspect").mockReturnValueOnce([false, null] as any);

			const value = TurtleUtils.inspect();
			const expected = null;

			expect(value).toBe(expected);
		});

		test("Valid block", () => {
			const block: Block = {
				name: "minecraft:cobblestone",
				metadata: 0,
				tags: {},
				state: {},
			};

			jest.spyOn(global.turtle, "inspect").mockReturnValueOnce([true, block] as any);

			const value = TurtleUtils.inspect();

			expect(value).toEqual(block);
		});
	});

	describe("inspectUp", () => {
		test("No block", () => {
			jest.spyOn(global.turtle, "inspectUp").mockReturnValueOnce([false, null] as any);

			const value = TurtleUtils.inspectUp();
			const expected = null;

			expect(value).toBe(expected);
		});

		test("Valid block", () => {
			const block: Block = {
				name: "minecraft:cobblestone",
				metadata: 0,
				tags: {},
				state: {},
			};

			jest.spyOn(global.turtle, "inspectUp").mockReturnValueOnce([true, block] as any);

			const value = TurtleUtils.inspectUp();

			expect(value).toEqual(block);
		});
	});

	describe("inspectDown", () => {
		test("No block", () => {
			jest.spyOn(global.turtle, "inspectDown").mockReturnValueOnce([false, null] as any);

			const value = TurtleUtils.inspectDown();
			const expected = null;

			expect(value).toBe(expected);
		});

		test("Valid block", () => {
			const block: Block = {
				name: "minecraft:cobblestone",
				metadata: 0,
				tags: {},
				state: {},
			};

			jest.spyOn(global.turtle, "inspectDown").mockReturnValueOnce([true, block] as any);

			const value = TurtleUtils.inspectDown();

			expect(value).toEqual(block);
		});
	});

	describe("drop", () => {
		test("Front", () => {
			const count = 32;
			const dropSpy = jest.spyOn(global.turtle, "drop");

			TurtleUtils.dropDirection("front", count);

			expect(dropSpy).toBeCalledTimes(1);
			expect(dropSpy).toHaveBeenLastCalledWith(count);
		});

		test("Up", () => {
			const count = 32;
			const dropSpy = jest.spyOn(global.turtle, "dropUp");

			TurtleUtils.dropDirection("up", count);
			expect(dropSpy).toBeCalledTimes(1);
			expect(dropSpy).toHaveBeenLastCalledWith(count);
		});

		test("Down", () => {
			const count = 32;
			const dropSpy = jest.spyOn(global.turtle, "dropDown");

			TurtleUtils.dropDirection("down", count);
			expect(dropSpy).toBeCalledTimes(1);
			expect(dropSpy).toHaveBeenLastCalledWith(count);
		});
	});

	describe("suck", () => {
		test("Front", () => {
			const count = 32;
			const dropSpy = jest.spyOn(global.turtle, "suck");

			TurtleUtils.suckDirection("front", count);
			expect(dropSpy).toBeCalledTimes(1);
			expect(dropSpy).toHaveBeenLastCalledWith(count);
		});

		test("Up", () => {
			const count = 32;
			const dropSpy = jest.spyOn(global.turtle, "suckUp");

			TurtleUtils.suckDirection("up", count);
			expect(dropSpy).toBeCalledTimes(1);
			expect(dropSpy).toHaveBeenLastCalledWith(count);
		});

		test("Down", () => {
			const count = 32;
			const dropSpy = jest.spyOn(global.turtle, "suckDown");

			TurtleUtils.suckDirection("down", count);
			expect(dropSpy).toBeCalledTimes(1);
			expect(dropSpy).toHaveBeenLastCalledWith(count);
		});
	});
});
