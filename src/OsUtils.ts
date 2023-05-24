/**
 * Returns os.time() in seconds.
 * @returns Time in seconds since the in-game midnight
 */
export function getTimeSeconds(): number {
	return os.time() * 50;
}
