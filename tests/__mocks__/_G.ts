// Pretty fucking cursed, but I don't know whether there's a better approach
// and I can't be bothered to figure it out

Object.defineProperty(global, "sleep", { value: () => {} });
Object.defineProperty(global, "write", { value: () => 1 });
Object.defineProperty(global, "print", { value: () => 1 });
Object.defineProperty(global, "printError", { value: () => {} });
Object.defineProperty(global, "read", { value: () => "Hello world" });
Object.defineProperty(global, "_HOST", { value: "CC_TEST" });
Object.defineProperty(global, "_CC_DEFAULT_SETTINGS", { value: "" });
