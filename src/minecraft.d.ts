export type BlockId = string;

export interface Block {
	name: string,
	metadata: number,
	state: Record<string, string>,
	tags: Record<string, boolean>
}
