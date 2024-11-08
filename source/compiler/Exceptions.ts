import { Node } from "../parser/Nodes";

export class UnknownNameError extends Error {
	constructor(name: string) {
		super(`Unknown name "${name}".`);
	}
}

export class VariableAlreadyDefinedError extends Error {
	constructor(name: string) {
		super(`Variable "${name}" already defined.`);
	}
}

export class VariableNotDefinedError extends Error {
	constructor(name: string) {
		super(`Variable "${name}" not defined.`);
	}
}

export class UnsupportedOperationError extends Error {
	constructor(message: string) {
		super(`Unsupported operation: ${message}`);
	}
}

export class UnreachableNodeError extends Error {
	constructor(node: Node) {
		super(`Unreachable node: ${node.type}`);
	}
}

export class NoLoopContextError extends Error {
	constructor() {
		super("No loop context found.");
	}
}

export class NoFunctionContextError extends Error {
	constructor() {
		super("No function context found.");
	}
}

export class PropertyAccessOnNonObjectError extends Error {
	constructor() {
		super("Property access on non-object.");
	}
}

export class ObjectNotIterableError extends Error {
	constructor() {
		super("Object not iterable.");
	}
}
