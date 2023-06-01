const turtleMock = {
	inspect: () => true,
	inspectDown: () => true,
	inspectUp: () => true,
	drop: () => true,
	dropUp: () => true,
	dropDown: () => true,
	suck: () => true,
	suckUp: () => true,
	suckDown: () => true,
};

Object.defineProperty(global, "turtle", { value: turtleMock });
