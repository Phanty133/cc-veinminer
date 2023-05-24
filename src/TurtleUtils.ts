import { Block } from "./minecraft";

export namespace TurtleUtils {
	export function inspect(): Block | null {
		const [hasBlock, data] = turtle.inspect();

		if (!hasBlock) return null;

		return data as Block;
	}

	export function inspectDown(): Block | null {
		const [hasBlock, data] = turtle.inspectDown();

		if (!hasBlock) return null;

		return data as Block;
	}

	export function inspectUp(): Block | null {
		const [hasBlock, data] = turtle.inspectUp();

		if (!hasBlock) return null;

		return data as Block;
	}

	export function dropDirection(dir: "front" | "up" | "down", count?: number) {
		if (dir === "front") {
			turtle.drop(count);
		} else if (dir === "down") {
			turtle.dropDown(count);
		} else {
			turtle.dropUp(count);
		}
	}

	export function suckDirection(dir: "front" | "up" | "down", count?: number) {
		if (dir === "front") {
			turtle.suck(count);
		} else if (dir === "down") {
			turtle.suckDown(count);
		} else {
			turtle.suckUp(count);
		}
	}
}
