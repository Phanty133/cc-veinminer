import {
	expect, describe, test, jest, beforeAll,
} from "@jest/globals";
import { getTimeSeconds } from "../src/OsUtils";

describe("OsUtils", () => {
	beforeAll(() => {
		jest.spyOn(global.os, "time" as any).mockReturnValue(1);
	});

	test("getTimeSeconds", () => {
		const time = 1;

		expect(getTimeSeconds()).toEqual(time * 50);
	});
});
