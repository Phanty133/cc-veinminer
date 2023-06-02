const peripheralMock = {
	wrap: () => null,
};

Object.defineProperty(global, "peripheral", { value: peripheralMock });
