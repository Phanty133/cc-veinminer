import {
	describe, test, expect,
} from "@jest/globals";
import "./__mocks__/_G";
import Vector from "./__mocks__/Vector";
import BlockMap, { MapData } from "../src/BlockMap";

describe("BlockMap", () => {
	describe("getBlockEntry", () => {
		test("Invalid block", () => {
			const map = new BlockMap();
			const entry = map.getBlockEntry(new Vector(1, 2, 3));

			expect(entry).toBe(null);
		});

		test("Air block", () => {
			const pos = new Vector(1, 2, 3);
			const expected = {
				name: null,
				checked: true,
				breakable: true,
			};

			const mapData: MapData = {};
			mapData[pos.x] = {};
			mapData[pos.x][pos.y] = {};
			mapData[pos.x][pos.y][pos.z] = { ...expected };
			const map = new BlockMap(mapData);

			expect(map.getBlockEntry(pos)).toEqual(expected);
		});

		test("Valid block", () => {
			const pos = new Vector(1, 2, 3);
			const expected = {
				name: "test_block",
				checked: true,
				breakable: true,
			};

			const mapData: MapData = {};
			mapData[pos.x] = {};
			mapData[pos.x][pos.y] = {};
			mapData[pos.x][pos.y][pos.z] = { ...expected };
			const map = new BlockMap(mapData);

			expect(map.getBlockEntry(pos)).toEqual(expected);
		});
	});

	describe("setBlock", () => {
		test("Air block", () => {
			const map = new BlockMap();
			const pos = new Vector(0, 1, 2);

			map.setBlock(pos, null);
			const expected = {
				name: null,
				checked: true,
				breakable: true,
			};

			expect(map.getBlockEntry(pos)).toEqual(expected);
		});

		test("Valid block", () => {
			const map = new BlockMap();
			const pos = new Vector(0, 1, 2);

			map.setBlock(pos, "test_block");
			const expected = {
				name: "test_block",
				checked: true,
				breakable: true,
			};

			expect(map.getBlockEntry(pos)).toEqual(expected);
		});

		test("Update block", () => {
			const map = new BlockMap();
			const pos = new Vector(0, 1, 2);

			map.setBlock(pos, "test_block");
			map.setBlock(pos, "test_block_1");
			const expected = {
				name: "test_block_1",
				checked: true,
				breakable: true,
			};

			expect(map.getBlockEntry(pos)).toEqual(expected);
		});

		test("Update unbreakable block", () => {
			const map = new BlockMap();
			const pos = new Vector(0, 1, 2);

			map.setBlock(pos, "test_block");
			map.setUnbreakable(pos);
			map.setBlock(pos, "test_block");
			const expected = {
				name: "test_block",
				checked: true,
				breakable: false,
			};

			expect(map.getBlockEntry(pos)).toEqual(expected);
		});
	});

	describe("setUnbreakable", () => {
		test("Invalid block", () => {
			const map = new BlockMap();
			const pos = new Vector(0, 1, 2);

			expect(map.setUnbreakable(pos)).toBeFalsy();
		});

		test("Valid block", () => {
			const map = new BlockMap();
			const pos = new Vector(0, 1, 2);

			map.setBlock(pos, "test_block");
			const expected = {
				name: "test_block",
				checked: true,
				breakable: false,
			};

			const status = map.setUnbreakable(pos);

			expect(map.getBlockEntry(pos)).toEqual(expected);
			expect(status).toBeTruthy();
		});
	});

	describe("removeBlock", () => {
		test("Invalid block", () => {
			const map = new BlockMap();
			const pos = new Vector(0, 1, 2);

			expect(map.removeBlock(pos)).toBeFalsy();
		});

		test("Valid block", () => {
			const map = new BlockMap();
			const pos = new Vector(0, 1, 2);

			map.setBlock(pos, "test_block");

			expect(map.removeBlock(pos)).toBeTruthy();
			expect(map.getBlockEntry(pos)).toEqual({ breakable: true, checked: true, name: null });
		});
	});
});
