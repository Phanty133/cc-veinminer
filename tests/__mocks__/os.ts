const osMock = {
	time: () => 0,
};

Object.defineProperty(global, "os", { value: osMock });
