// Basically a glorified Record<Vector, BlockId>

import type { BlockId } from "./minecraft";

export interface Block {
	name: BlockId | null,
	checked: boolean,
}

export default class BlockMap {
	// {x: {y: {z: ID}}}
	private blocks: Record<number, Record<number, Record<number, Block>>>;

	constructor() {
		this.blocks = {};
	}

	getBlockEntry(pos: Vector): Block | null {
		const x = this.blocks[pos.x];

		if (!x) return null;

		const y = x[pos.y];

		if (!y) return null;

		return y[pos.z] ?? null;
	}

	getBlock(pos: Vector): BlockId | null {
		return this.getBlockEntry(pos)?.name ?? null;
	}

	isBlockChecked(pos: Vector): boolean {
		return this.getBlockEntry(pos)?.checked ?? null;
	}

	setBlock(pos: Vector, name: BlockId) {
		const block = this.getBlock(pos);
		const newBlockVal = { name, checked: true };

		if (block === null) {
			if (!(pos.x in this.blocks)) this.blocks[pos.x] = {};
			if (!(pos.y in this.blocks[pos.x])) this.blocks[pos.x][pos.y] = {};
			this.blocks[pos.x][pos.y][pos.z] = newBlockVal;
		} else {
			this.blocks[pos.x][pos.y][pos.z] = newBlockVal;
		}
	}

	removeBlock(pos: Vector): boolean {
		if (!(pos.x in this.blocks)) return false;
		if (!(pos.y in this.blocks[pos.x])) return false;
		if (!(pos.z in this.blocks[pos.x][pos.y])) return false;

		this.blocks[pos.x][pos.y][pos.z].name = null;
		this.blocks[pos.x][pos.y][pos.z].checked = true;
		return true;
	}
}