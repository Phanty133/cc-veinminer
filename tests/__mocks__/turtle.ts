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
	getFuelLevel: () => 0,
	select: () => true,
	refuel: () => true,
	getItemDetail: () => null,
	getItemCount: () => 0,
};

Object.defineProperty(global, "turtle", { value: turtleMock });
