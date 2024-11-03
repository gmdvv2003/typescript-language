export class ProgramExit extends Error {
	constructor() {
		super("Programa finalizado pelo usuário.");
	}
}

export class ProgramFinished extends Error {
	constructor() {
		super("Programa finalizado.");
	}
}
