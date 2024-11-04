export class ProgramExit extends Error {
	constructor() {
		super("Program ended by user.");
	}
}

export class ProgramFinished extends Error {
	constructor() {
		super("Program finished.");
	}
}
