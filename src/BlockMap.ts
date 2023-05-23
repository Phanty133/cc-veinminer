import type { BlockId } from "./minecraft";

export interface Block {
	name: BlockId | null,
	checked: boolean,
	breakable: boolean,
}

/** Maps a Vector coordinate to a known block */
export default class BlockMap {
	/** {x: {y: {z: ID}}} */
	private blocks: Record<number, Record<number, Record<number, Block>>>;

	/**
	 * Initialize the map
	 */
	constructor() {
		this.blocks = {};
	}

	/**
	 * Retrieves block data at a position
	 * @param pos Relative coordinate to check
	 * @returns The block data if known, null otherwise
	 */
	getBlockEntry(pos: Vector): Block | null {
		const x = this.blocks[pos.x];

		if (!x) return null;

		const y = x[pos.y];

		if (!y) return null;

		return y[pos.z] ?? null;
	}

	/**
	 * Update block name at a position.
	 * If the name matches the previous block data, the breakable attribute won't be reset.
	 * @param pos Relative coordinate to update
	 * @param name New block name to update
	 * @returns Block data that was added
	 */
	setBlock(pos: Vector, name: BlockId) {
		const block = this.getBlockEntry(pos);
		const newBlockVal: Block = {
			name,
			checked: true,
			breakable: true,
		};

		if (block === null) {
			if (!(pos.x in this.blocks)) this.blocks[pos.x] = {};
			if (!(pos.y in this.blocks[pos.x])) this.blocks[pos.x][pos.y] = {};
			this.blocks[pos.x][pos.y][pos.z] = newBlockVal;
		} else {
			const prevBlock = this.blocks[pos.x][pos.y][pos.z];

			if (prevBlock?.name === name) newBlockVal.breakable = prevBlock.breakable;

			this.blocks[pos.x][pos.y][pos.z] = newBlockVal;
		}

		return newBlockVal;
	}

	/**
	 * Marks a known block in the map as unbreakable
	 * @param pos Relative coordinate to set
	 * @returns True if successful, False if block is not in map
	 */
	setUnbreakable(pos: Vector): boolean {
		const block = this.getBlockEntry(pos);

		if (block === null) return false;

		print("INFO: Block set unbreakable");

		this.blocks[pos.x][pos.y][pos.z].breakable = false;

		return true;
	}

	/**
	 * Removes block from the map
	 * @param pos Relative coordinate to remove
	 * @returns True if successful, False if block not in map
	 */
	removeBlock(pos: Vector): boolean {
		if (!(pos.x in this.blocks)) return false;
		if (!(pos.y in this.blocks[pos.x])) return false;
		if (!(pos.z in this.blocks[pos.x][pos.y])) return false;

		this.blocks[pos.x][pos.y][pos.z].name = null;
		this.blocks[pos.x][pos.y][pos.z].checked = true;
		return true;
	}
}
