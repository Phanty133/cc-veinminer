/**
 * Implementation of CC's Vector class for testing
 * Technically a fake, not a mock, but ¯\_(ツ)_/¯
 */
export default class Vector {
	x: number;

	y: number;

	z: number;

	constructor(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	add(other: Vector) {
		return new Vector(
			this.x + other.x,
			this.y + other.y,
			this.z + other.z,
		);
	}

	sub(other: Vector) {
		return new Vector(
			this.x - other.x,
			this.y - other.y,
			this.z - other.z,
		);
	}

	mul(m: number) {
		return new Vector(
			this.x * m,
			this.y * m,
			this.z * m,
		);
	}

	div(m: number) {
		return new Vector(
			this.x / m,
			this.y / m,
			this.z / m,
		);
	}

	unm() {
		return new Vector(
			-this.x,
			-this.y,
			-this.z,
		);
	}

	dot(other: Vector) {
		return this.x * other.x + this.y * other.y + this.z * other.z;
	}

	cross(other: Vector) {
		return new Vector(
			this.y * other.z - this.z * other.y,
			this.z * other.x - this.x * other.z,
			this.x * other.y - this.y * other.x,
		);
	}

	length() {
		return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
	}

	normalize() {
		return this.div(this.length());
	}

	// TODO: Implement the tolerance argument
	round() {
		return new Vector(
			Math.round(this.x),
			Math.round(this.y),
			Math.round(this.z),
		);
	}

	tostring() {
		return `(${this.x} ${this.y} ${this.z})`;
	}

	equals(other: Vector) {
		return this.x === other.x && this.y === other.y && this.z === other.z;
	}
}
